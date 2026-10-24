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
[Route("api/payments/kpay")]
[KPayEnabled]
public sealed class KPayPaymentsController : ControllerBase
{
    private readonly IKPayPaymentService _payments;
    private readonly IConfiguration _configuration;

    public KPayPaymentsController(IKPayPaymentService payments, IConfiguration configuration)
    {
        _payments = payments;
        _configuration = configuration;
    }

    [HttpPost("checkout")]
    [Authorize]
    public async Task<IActionResult> CreateCheckout([FromBody] CreateKPayCheckoutDto dto)
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

    [HttpPost("webhook")]
    [AllowAnonymous]
    [EnableRateLimiting("public-browse")]
    public async Task<IActionResult> Webhook()
    {
        var secret = _configuration["KPay:WebhookSecret"];
        var signature = Request.Headers["X-KPAY-Signature"].ToString();
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var rawBody = await reader.ReadToEndAsync();
        if (string.IsNullOrWhiteSpace(secret) || !IsValidSignature(rawBody, signature, secret))
            return Unauthorized();

        KPayWebhookDto? dto;
        try { dto = JsonSerializer.Deserialize<KPayWebhookDto>(rawBody); }
        catch (JsonException) { return BadRequest(); }
        if (dto == null
            || string.IsNullOrWhiteSpace(dto.Event)
            || !dto.Event.StartsWith("payment.", StringComparison.Ordinal)
            || string.IsNullOrWhiteSpace(dto.PaymentId)
            || string.IsNullOrWhiteSpace(dto.ExternalId)
            || string.IsNullOrWhiteSpace(dto.Status)
            || dto.Amount <= 0)
            return BadRequest();

        return await _payments.HandleWebhookAsync(dto.PaymentId, dto.ExternalId, dto.Status, dto.Amount)
            ? Ok() : NotFound();
    }

    private bool TryGetOrganizerId(out Guid organizerId)
    {
        organizerId = Guid.Empty;
        return User.FindFirst("type")?.Value == "organizer"
            && Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId);
    }

    private static bool IsValidSignature(string body, string signature, string secret)
    {
        try
        {
            var supplied = Convert.FromHexString(signature);
            var expected = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(body));
            return supplied.Length == expected.Length && CryptographicOperations.FixedTimeEquals(supplied, expected);
        }
        catch (FormatException) { return false; }
    }
}

[AttributeUsage(AttributeTargets.Class)]
public sealed class KPayEnabledAttribute : Attribute, Microsoft.AspNetCore.Mvc.Filters.IResourceFilter
{
    public void OnResourceExecuting(Microsoft.AspNetCore.Mvc.Filters.ResourceExecutingContext context)
    {
        if (!AdminDbContext.KPayEnabled) context.Result = new NotFoundResult();
    }
    public void OnResourceExecuted(Microsoft.AspNetCore.Mvc.Filters.ResourceExecutedContext context) { }
}

public sealed class KPayWebhookDto
{
    [JsonPropertyName("event")]
    public string Event { get; set; } = string.Empty;
    [JsonPropertyName("paymentId")]
    public string PaymentId { get; set; } = string.Empty;
    [JsonPropertyName("externalId")]
    public string ExternalId { get; set; } = string.Empty;
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }
}
