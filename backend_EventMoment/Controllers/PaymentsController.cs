using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend_EventMoment.Controllers;

[ApiController]
[Route("api/payments")]
[NotchPayEnabled]
public class PaymentsController : ControllerBase
{
    private readonly INotchPayPaymentService _payments;
    private readonly IConfiguration _configuration;

    public PaymentsController(INotchPayPaymentService payments, IConfiguration configuration)
    {
        _payments = payments;
        _configuration = configuration;
    }

    [HttpPost("notchpay/checkout")]
    [Authorize]
    public async Task<IActionResult> CreateCheckout([FromBody] CreateNotchPayCheckoutDto dto)
    {
        if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
        return Ok(await _payments.CreateCheckoutAsync(organizerId, dto.PlanId));
    }

    [HttpGet("{paymentId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetStatus(Guid paymentId)
    {
        if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
        return Ok(await _payments.GetStatusAsync(paymentId, organizerId));
    }

    [HttpPost("notchpay/webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook()
    {
        var secret = _configuration["NotchPay:WebhookSecret"];
        var signature = Request.Headers["x-notch-signature"].ToString();
        var rawBody = await ReadRawBodyAsync();
        if (string.IsNullOrWhiteSpace(secret) || !IsValidSignature(rawBody, signature, secret))
            return Unauthorized();

        NotchPayWebhookDto? dto;
        try
        {
            dto = JsonSerializer.Deserialize<NotchPayWebhookDto>(rawBody);
        }
        catch (JsonException)
        {
            return BadRequest();
        }
        if (dto == null || !dto.Type.StartsWith("payment.", StringComparison.Ordinal))
            return BadRequest();

        return await _payments.HandleWebhookAsync(dto.Data.Reference) ? Ok() : NotFound();
    }

    private async Task<string> ReadRawBodyAsync()
    {
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        return await reader.ReadToEndAsync();
    }

    private static bool IsValidSignature(string rawBody, string signature, string secret)
    {
        try
        {
            var supplied = Convert.FromHexString(signature);
            var expected = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(rawBody));
            return supplied.Length == expected.Length && CryptographicOperations.FixedTimeEquals(supplied, expected);
        }
        catch (FormatException)
        {
            return false;
        }
    }

    private bool TryGetOrganizerId(out Guid organizerId)
    {
        organizerId = Guid.Empty;
        return User.FindFirst("type")?.Value == "organizer"
            && Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId);
    }
}
// Paiement Notch Pay désactivé (Payments:NotchPay:Enabled = false) : les routes n'existent pas.
[AttributeUsage(AttributeTargets.Class)]
public sealed class NotchPayEnabledAttribute : Attribute, Microsoft.AspNetCore.Mvc.Filters.IResourceFilter
{
    public void OnResourceExecuting(Microsoft.AspNetCore.Mvc.Filters.ResourceExecutingContext context)
    {
        if (!backend_EventMoment.Data.AdminDbContext.NotchPayEnabled)
            context.Result = new NotFoundResult();
    }

    public void OnResourceExecuted(Microsoft.AspNetCore.Mvc.Filters.ResourceExecutedContext context) { }
}
