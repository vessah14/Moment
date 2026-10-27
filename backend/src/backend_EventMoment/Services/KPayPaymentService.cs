using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using backend_EventMoment.Services.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services;

/// <summary>Hosted KPay checkout for paid subscriptions. KPay credentials remain server-side.</summary>
public sealed class KPayPaymentService : IKPayPaymentService
{
    private const string ApiBaseUrl = "https://admin.kpay.site/api/v1";
    private readonly AdminDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public KPayPaymentService(AdminDbContext context, IConfiguration configuration, IHttpClientFactory factory)
    {
        _context = context;
        _configuration = configuration;
        _httpClient = factory.CreateClient();
    }

    public async Task<KPayCheckoutDto> CreateCheckoutAsync(Guid organizerId, Guid planId, Guid idempotencyKey)
    {
        if (idempotencyKey == Guid.Empty)
            throw new InvalidOperationException("Une clé d’idempotence valide est obligatoire.");
        await EmailVerificationGuard.EnsureAsync(_context, organizerId);

        var existing = await _context.KPayPayments
            .FirstOrDefaultAsync(x => x.OrganizerId == organizerId && x.IdempotencyKey == idempotencyKey);
        if (existing != null)
            return ReuseCheckout(existing, planId);

        var plan = await _context.SubscriptionPlans.FirstOrDefaultAsync(x => x.Id == planId && x.IsActive)
            ?? throw new KeyNotFoundException("Offre introuvable.");
        if (plan.PriceCents <= 0 || plan.PriceCents % 100 != 0
            || !string.Equals(plan.Currency, "XAF", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Cette offre ne peut pas être payée en ligne.");

        var organizer = await _context.Organizers.FirstOrDefaultAsync(x => x.Id == organizerId)
            ?? throw new KeyNotFoundException("Compte introuvable.");
        var payment = new KPayPayment
        {
            Id = Guid.NewGuid(), OrganizerId = organizerId, PlanId = plan.Id,
            ExternalId = Guid.NewGuid().ToString("N"), IdempotencyKey = idempotencyKey,
            Amount = plan.PriceCents / 100,
        };
        _context.KPayPayments.Add(payment);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            _context.Entry(payment).State = EntityState.Detached;
            existing = await _context.KPayPayments
                .FirstOrDefaultAsync(x => x.OrganizerId == organizerId && x.IdempotencyKey == idempotencyKey);
            if (existing != null)
                return ReuseCheckout(existing, planId);
            throw;
        }

        try
        {
            var frontendUrl = _configuration["Frontend:BaseUrl"]?.TrimEnd('/')
                ?? throw new InvalidOperationException("Frontend:BaseUrl n'est pas configurée.");
            var returnUrl = $"{frontendUrl}/dashboard/parametres?tab=billing&paymentId={payment.Id:D}";
            var request = new KPayInitRequest
            {
                Amount = payment.Amount,
                Currency = "XAF",
                ExternalId = payment.ExternalId,
                ReturnUrl = returnUrl,
                SuccessUrl = returnUrl,
                CancelUrl = returnUrl,
                CustomerEmail = organizer.Email,
                Description = $"Abonnement {plan.Label}",
            };
            using var message = new HttpRequestMessage(HttpMethod.Post, $"{ApiBaseUrl}/payments/init")
            {
                Content = JsonContent.Create(request),
            };
            AddApiCredentials(message);
            using var response = await _httpClient.SendAsync(message);
            if (!response.IsSuccessStatusCode)
            {
                var providerMessage = await ReadProviderErrorAsync(response);
                var detail = string.IsNullOrWhiteSpace(providerMessage)
                    ? string.Empty
                    : $" Détail KPay : {providerMessage}";
                throw new HttpRequestException(
                    $"KPay a refusé la création du paiement (HTTP {(int)response.StatusCode}).{detail}",
                    null,
                    response.StatusCode);
            }

            var result = await response.Content.ReadFromJsonAsync<KPayPaymentResponse>()
                ?? throw new HttpRequestException("Réponse KPay invalide.");
            if (string.IsNullOrWhiteSpace(result.Id)
                || !string.Equals(result.ExternalId, payment.ExternalId, StringComparison.Ordinal)
                || result.Amount != payment.Amount
                || !string.Equals(result.Currency, "XAF", StringComparison.OrdinalIgnoreCase)
                || !Uri.TryCreate(result.GatewayUrl, UriKind.Absolute, out var gatewayUri)
                || gatewayUri.Scheme != Uri.UriSchemeHttps
                || !(gatewayUri.Host.Equals("kpay.site", StringComparison.OrdinalIgnoreCase)
                    || gatewayUri.Host.EndsWith(".kpay.site", StringComparison.OrdinalIgnoreCase)
                    || gatewayUri.Host.Equals("kpay.cm", StringComparison.OrdinalIgnoreCase)
                    || gatewayUri.Host.EndsWith(".kpay.cm", StringComparison.OrdinalIgnoreCase)))
                throw new HttpRequestException("KPay a retourné une transaction ou une URL invalide.");

            payment.TransactionId = result.Id;
            payment.CheckoutUrl = result.GatewayUrl;
            payment.Status = MapStatus(result.Status);
            payment.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            return new KPayCheckoutDto { PaymentId = payment.Id, CheckoutUrl = payment.CheckoutUrl };
        }
        catch
        {
            payment.Status = "FAILED";
            payment.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            throw;
        }
    }

    public async Task<KPayPaymentStatusDto> GetStatusAsync(Guid paymentId, Guid organizerId)
    {
        var payment = await _context.KPayPayments.Include(x => x.Plan)
            .FirstOrDefaultAsync(x => x.Id == paymentId && x.OrganizerId == organizerId)
            ?? throw new KeyNotFoundException("Paiement introuvable.");
        if (payment.Status is "PENDING" or "CREATED" && !string.IsNullOrWhiteSpace(payment.TransactionId))
        {
            var remote = await GetRemotePaymentAsync(payment.TransactionId);
            await ApplyStatusAsync(payment, remote.Id, remote.ExternalId, remote.Status, remote.Amount, remote.Currency);
        }
        return Map(payment);
    }

    public async Task<bool> HandleWebhookAsync(string paymentId, string externalId, string status, decimal amount)
    {
        if (string.IsNullOrWhiteSpace(paymentId) || string.IsNullOrWhiteSpace(externalId)) return false;
        var payment = await _context.KPayPayments.IgnoreQueryFilters().Include(x => x.Plan)
            .FirstOrDefaultAsync(x => x.ExternalId == externalId && x.TransactionId == paymentId);
        if (payment == null || payment.Amount != amount) return false;

        // The signed callback identifies the transaction; KPay's authenticated API confirms its final status.
        var remote = await GetRemotePaymentAsync(paymentId);
        if (!string.Equals(remote.Status, status, StringComparison.OrdinalIgnoreCase)) return false;
        await ApplyStatusAsync(payment, remote.Id, remote.ExternalId, remote.Status, remote.Amount, remote.Currency);
        return true;
    }

    private async Task<KPayPaymentResponse> GetRemotePaymentAsync(string paymentId)
    {
        using var message = new HttpRequestMessage(HttpMethod.Get,
            $"{ApiBaseUrl}/payments/{Uri.EscapeDataString(paymentId)}");
        AddApiCredentials(message);
        using var response = await _httpClient.SendAsync(message);
        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException("Impossible de vérifier le paiement auprès de KPay.");
        return await response.Content.ReadFromJsonAsync<KPayPaymentResponse>()
            ?? throw new HttpRequestException("Réponse de statut KPay invalide.");
    }

    private static KPayCheckoutDto ReuseCheckout(KPayPayment payment, Guid planId)
    {
        if (payment.PlanId != planId)
            throw new IdempotencyConflictException(
                "Cette clé d’idempotence a déjà été utilisée pour une autre offre.");
        if (string.IsNullOrWhiteSpace(payment.CheckoutUrl))
            throw new IdempotencyConflictException(
                $"La demande de paiement existe déjà mais son résultat est incertain (référence {payment.ExternalId}). Vérifiez cette référence dans KPay avant d’en créer un autre.");
        return new KPayCheckoutDto { PaymentId = payment.Id, CheckoutUrl = payment.CheckoutUrl };
    }

    private async Task ApplyStatusAsync(KPayPayment payment, string remoteId, string externalId,
        string remoteStatus, decimal amount, string? currency)
    {
        if (!string.Equals(payment.TransactionId, remoteId, StringComparison.Ordinal)
            || !string.Equals(payment.ExternalId, externalId, StringComparison.Ordinal)
            || payment.Amount != amount
            || !string.Equals(currency, "XAF", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Les informations du paiement KPay ne correspondent pas.");
        if (payment.Status == "SUCCESSFUL") return;

        var status = MapStatus(remoteStatus);
        if (status == payment.Status) return;
        await using var transaction = await _context.Database.BeginTransactionAsync();
        payment.Status = status;
        payment.UpdatedAt = DateTimeOffset.UtcNow;
        if (status == "SUCCESSFUL")
        {
            var now = DateTimeOffset.UtcNow;
            var activeSubscriptions = await _context.OrganizerSubscriptions.IgnoreQueryFilters()
                .Where(x => x.OrganizerId == payment.OrganizerId
                    && (x.Status == SubscriptionStatus.Actif || x.Status == SubscriptionStatus.Essai))
                .ToListAsync();
            foreach (var active in activeSubscriptions)
            {
                active.Status = SubscriptionStatus.Annule;
                active.EndsAt = now;
            }

            var plan = payment.Plan ?? await _context.SubscriptionPlans.FirstAsync(x => x.Id == payment.PlanId);
            _context.OrganizerSubscriptions.Add(new UserSubscription
            {
                Id = Guid.NewGuid(), OrganizerId = payment.OrganizerId, PlanId = payment.PlanId,
                KPayPaymentId = payment.Id, Status = SubscriptionStatus.Actif, StartedAt = now,
                EndsAt = plan.Billing switch
                {
                    PlanBilling.Mensuel => now.AddMonths(1),
                    PlanBilling.Annuel => now.AddYears(1),
                    _ => null,
                },
            });
            payment.PaidAt = now;
        }
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    }

    private static string MapStatus(string? status) => status?.ToUpperInvariant() switch
    {
        "COMPLETED" or "SUCCESSFUL" => "SUCCESSFUL",
        "EXPIRED" => "EXPIRED",
        "FAILED" or "CANCELLED" or "CANCELED" => "FAILED",
        _ => "PENDING",
    };

    private static async Task<string?> ReadProviderErrorAsync(HttpResponseMessage response)
    {
        var body = await response.Content.ReadAsStringAsync();
        if (string.IsNullOrWhiteSpace(body))
            return null;

        try
        {
            using var document = JsonDocument.Parse(body);
            if (document.RootElement.ValueKind != JsonValueKind.Object)
                return null;

            foreach (var name in new[] { "message", "error", "detail", "title" })
            {
                if (!TryGetString(document.RootElement, name, out var message))
                    continue;

                message = message.Trim();
                if (message.Length > 300)
                    message = message[..300];
                return message;
            }
        }
        catch (JsonException)
        {
            // A non-JSON response is not safe or useful to copy into application logs.
        }

        return null;
    }

    private static bool TryGetString(JsonElement element, string propertyName, out string value)
    {
        foreach (var property in element.EnumerateObject())
        {
            if (!property.Name.Equals(propertyName, StringComparison.OrdinalIgnoreCase))
                continue;

            if (property.Value.ValueKind == JsonValueKind.String)
            {
                value = property.Value.GetString() ?? string.Empty;
                return !string.IsNullOrWhiteSpace(value);
            }

            if (property.Value.ValueKind == JsonValueKind.Object
                && TryGetString(property.Value, "message", out value))
                return true;
        }

        value = string.Empty;
        return false;
    }

    private void AddApiCredentials(HttpRequestMessage message)
    {
        var apiKey = _configuration["KPay:ApiKey"];
        var secretKey = _configuration["KPay:SecretKey"];
        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(secretKey))
            throw new InvalidOperationException("Les clés API sandbox KPay ne sont pas configurées.");
        var allowLive = _configuration.GetValue("KPay:AllowLive", false);
        if (!apiKey.StartsWith("kpay_test_", StringComparison.Ordinal)
            && !(allowLive && apiKey.StartsWith("kpay_live_", StringComparison.Ordinal)))
            throw new InvalidOperationException("KPay est limité aux clés sandbox. Le mode live doit être activé explicitement.");
        message.Headers.TryAddWithoutValidation("X-API-Key", apiKey);
        message.Headers.TryAddWithoutValidation("X-Secret-Key", secretKey);
    }

    private static KPayPaymentStatusDto Map(KPayPayment payment) => new()
    {
        PaymentId = payment.Id, Status = payment.Status, PlanLabel = payment.Plan?.Label ?? string.Empty,
        Amount = payment.Amount, CreatedAt = payment.CreatedAt, PaidAt = payment.PaidAt,
    };

    private sealed class KPayInitRequest
    {
        [JsonPropertyName("amount")] public int Amount { get; init; }
        [JsonPropertyName("currency")] public string Currency { get; init; } = "XAF";
        [JsonPropertyName("externalId")] public string ExternalId { get; init; } = string.Empty;
        [JsonPropertyName("returnUrl")] public string ReturnUrl { get; init; } = string.Empty;
        [JsonPropertyName("successUrl")] public string SuccessUrl { get; init; } = string.Empty;
        [JsonPropertyName("cancelUrl")] public string CancelUrl { get; init; } = string.Empty;
        [JsonPropertyName("customerEmail")] public string CustomerEmail { get; init; } = string.Empty;
        [JsonPropertyName("description")] public string Description { get; init; } = string.Empty;
    }

    private sealed class KPayPaymentResponse
    {
        [JsonPropertyName("id")] public string Id { get; init; } = string.Empty;
        [JsonPropertyName("externalId")] public string ExternalId { get; init; } = string.Empty;
        [JsonPropertyName("status")] public string Status { get; init; } = string.Empty;
        [JsonPropertyName("amount")] public decimal Amount { get; init; }
        [JsonPropertyName("currency")] public string Currency { get; init; } = string.Empty;
        [JsonPropertyName("gatewayUrl")] public string GatewayUrl { get; init; } = string.Empty;
    }
}
