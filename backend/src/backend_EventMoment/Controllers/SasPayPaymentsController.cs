using System.Globalization;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace backend_EventMoment.Controllers;

[ApiController]
[Route("api/payments/saspay")]
[SasPayEnabled]
public sealed class SasPayPaymentsController : ControllerBase
{
    // Écart toléré entre l'horodatage signé par SasPay et notre horloge (rejeu).
    private const long SignatureToleranceSeconds = 300;

    private readonly ISasPayPaymentService _payments;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SasPayPaymentsController> _logger;

    public SasPayPaymentsController(ISasPayPaymentService payments, IConfiguration configuration,
        ILogger<SasPayPaymentsController> logger)
    {
        _payments = payments;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("checkout")]
    [Authorize]
    public async Task<IActionResult> CreateCheckout([FromBody] CreateSasPayCheckoutDto dto)
    {
        if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
        if (!Guid.TryParse(Request.Headers["Idempotency-Key"].ToString(), out var idempotencyKey)
            || idempotencyKey == Guid.Empty)
            return BadRequest(new { error = "L’en-tête Idempotency-Key doit contenir un UUID valide." });
        return Ok(await _payments.CreateCheckoutAsync(organizerId, dto.PlanId, idempotencyKey));
    }

    [HttpGet("{paymentId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetStatus(Guid paymentId)
    {
        if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
        return Ok(await _payments.GetStatusAsync(paymentId, organizerId));
    }

    // URL à déclarer dans le tableau de bord SasPay : https://<api>/api/payments/saspay/webhook
    [HttpPost("webhook")]
    [AllowAnonymous]
    [EnableRateLimiting("public-browse")]
    public async Task<IActionResult> Webhook()
    {
        var secret = _configuration["SasPay:WebhookSecret"];
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var rawBody = await reader.ReadToEndAsync();
        if (string.IsNullOrWhiteSpace(secret)
            || !IsValidSignature(rawBody,
                Request.Headers["X-Webhook-Timestamp"].ToString(),
                Request.Headers["X-Webhook-Signature"].ToString(),
                secret,
                DateTimeOffset.UtcNow))
        {
            // Secret absent, signature fausse ou rejouée : mauvaise configuration ou tentative
            // de falsification, à surveiller (OWASP A09).
            _logger.LogWarning(
                "Webhook SasPay rejeté (secret configuré : {SecretConfigured}) depuis {RemoteIp}",
                !string.IsNullOrWhiteSpace(secret), HttpContext.Connection.RemoteIpAddress);
            return StatusCode(StatusCodes.Status403Forbidden);
        }

        SasPayWebhookDto? dto;
        try { dto = JsonSerializer.Deserialize<SasPayWebhookDto>(rawBody); }
        catch (JsonException) { return BadRequest(); }
        if (dto == null || string.IsNullOrWhiteSpace(dto.Event)) return BadRequest();

        // Seule une transaction réussie change quelque chose ; les autres événements
        // (test, échec d'une tentative, reversements…) sont simplement acquittés.
        if (dto.Event != "transaction.success") return Ok();
        if (dto.Data == null || string.IsNullOrWhiteSpace(dto.Data.Id) || dto.Data.Amount is not > 0)
            return BadRequest();

        // Toujours 200 une fois la signature validée : une transaction non rattachée est soit
        // déjà traitée (webhook rejoué), soit étrangère au site (lien de paiement…). La session
        // étant enregistrée avant la redirection, un nouvel essai de SasPay n'apporterait rien.
        if (!await _payments.HandleTransactionSuccessAsync(dto.Data.Id, dto.Data.Amount.Value, dto.Data.Currency ?? string.Empty))
            _logger.LogInformation("Webhook SasPay : transaction {TransactionId} non rattachée à un paiement en attente", dto.Data.Id);
        return Ok();
    }

    private bool TryGetOrganizerId(out Guid organizerId)
    {
        organizerId = Guid.Empty;
        return User.FindFirst("type")?.Value == "organizer"
            && Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId);
    }

    // Signature SasPay : HMAC-SHA256 (hex) de « horodatage.corps_brut » avec le secret du webhook.
    public static bool IsValidSignature(string body, string timestamp, string signature, string secret, DateTimeOffset now)
    {
        if (!long.TryParse(timestamp, NumberStyles.None, CultureInfo.InvariantCulture, out var seconds)
            || Math.Abs(now.ToUnixTimeSeconds() - seconds) > SignatureToleranceSeconds)
            return false;
        try
        {
            var supplied = Convert.FromHexString(signature.Trim());
            var expected = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes($"{timestamp}.{body}"));
            return supplied.Length == expected.Length && CryptographicOperations.FixedTimeEquals(supplied, expected);
        }
        catch (FormatException) { return false; }
    }
}

[AttributeUsage(AttributeTargets.Class)]
public sealed class SasPayEnabledAttribute : Attribute, Microsoft.AspNetCore.Mvc.Filters.IResourceFilter
{
    public void OnResourceExecuting(Microsoft.AspNetCore.Mvc.Filters.ResourceExecutingContext context)
    {
        if (!AdminDbContext.SasPayEnabled) context.Result = new NotFoundResult();
    }
    public void OnResourceExecuted(Microsoft.AspNetCore.Mvc.Filters.ResourceExecutedContext context) { }
}

public sealed class SasPayWebhookDto
{
    [JsonPropertyName("event")]
    public string Event { get; set; } = string.Empty;
    [JsonPropertyName("data")]
    public SasPayWebhookTransactionDto? Data { get; set; }
}

public sealed class SasPayWebhookTransactionDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    [JsonPropertyName("status")]
    public string? Status { get; set; }
    [JsonPropertyName("amount"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    public decimal? Amount { get; set; }
    [JsonPropertyName("currency")]
    public string? Currency { get; set; }
}
