using System.Globalization;
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

/// <summary>
/// Paiement des abonnements par la page de paiement hébergée SasPay (checkout session).
/// La clé secrète SasPay reste côté serveur. Un paiement n'est jamais validé sur la seule
/// foi du navigateur ou du webhook : son statut est relu auprès de l'API SasPay.
/// </summary>
public sealed class SasPayPaymentService : ISasPayPaymentService
{
    private const string ApiBaseUrl = "https://api.saspay.me/api/v1";
    // Un webhook ne cite que la transaction : on ne cherche la session correspondante que
    // parmi les paiements récents encore en attente, du même montant.
    private static readonly TimeSpan WebhookLookback = TimeSpan.FromDays(3);
    private const int WebhookCandidates = 20;

    private readonly AdminDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public SasPayPaymentService(AdminDbContext context, IConfiguration configuration, IHttpClientFactory factory)
    {
        _context = context;
        _configuration = configuration;
        _httpClient = factory.CreateClient();
    }

    public async Task<SasPayCheckoutDto> CreateCheckoutAsync(Guid organizerId, Guid planId, Guid idempotencyKey)
    {
        if (idempotencyKey == Guid.Empty)
            throw new InvalidOperationException("Une clé d’idempotence valide est obligatoire.");
        await EmailVerificationGuard.EnsureAsync(_context, organizerId);

        // SasPay n'accepte pas d'Idempotency-Key sur la création de session : c'est notre
        // propre clé, unique par organisateur, qui empêche une double session.
        var existing = await _context.SubscriptionPayments
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
        var payment = new SubscriptionPayment
        {
            Id = Guid.NewGuid(), OrganizerId = organizerId, PlanId = plan.Id,
            ExternalId = Guid.NewGuid().ToString("N"), IdempotencyKey = idempotencyKey,
            Amount = plan.PriceCents / 100,
        };
        _context.SubscriptionPayments.Add(payment);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            _context.Entry(payment).State = EntityState.Detached;
            existing = await _context.SubscriptionPayments
                .FirstOrDefaultAsync(x => x.OrganizerId == organizerId && x.IdempotencyKey == idempotencyKey);
            if (existing != null)
                return ReuseCheckout(existing, planId);
            throw;
        }

        try
        {
            var frontendUrl = _configuration["Frontend:BaseUrl"]?.TrimEnd('/')
                ?? throw new PaymentProviderException("Frontend:BaseUrl n'est pas configurée.");
            var request = new CheckoutSessionRequest
            {
                Amount = FormatAmount(payment.Amount),
                Currency = "XAF",
                Country = "CM",
                CustomerEmail = organizer.Email,
                CustomerName = string.IsNullOrWhiteSpace(organizer.FullName) ? organizer.Email : organizer.FullName.Trim(),
                Description = $"Abonnement {plan.Label}",
                // SasPay renvoie ici le navigateur après un paiement réussi, sans paramètre ajouté.
                ReturnUrl = $"{frontendUrl}/dashboard/parametres?tab=billing&paymentId={payment.Id:D}",
                Metadata = new Dictionary<string, string>
                {
                    ["payment_id"] = payment.Id.ToString("D"),
                    ["external_id"] = payment.ExternalId,
                },
            };
            using var message = new HttpRequestMessage(HttpMethod.Post, $"{ApiBaseUrl}/checkout-sessions/")
            {
                Content = JsonContent.Create(request),
            };
            var session = await SendAsync<CheckoutSession>(message, "la création du paiement");
            if (string.IsNullOrWhiteSpace(session.Id)
                || !AmountEquals(session.Amount, payment.Amount)
                || !string.Equals(session.Currency, "XAF", StringComparison.OrdinalIgnoreCase)
                || !IsSasPayCheckoutUrl(session.CheckoutUrl))
                throw new PaymentProviderException("SasPay a retourné une session ou une URL de paiement invalide.");

            payment.SessionId = session.Id;
            payment.CheckoutUrl = session.CheckoutUrl;
            payment.Status = "PENDING";
            payment.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            return new SasPayCheckoutDto { PaymentId = payment.Id, CheckoutUrl = payment.CheckoutUrl };
        }
        catch
        {
            payment.Status = "FAILED";
            payment.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            throw;
        }
    }

    public async Task<SasPayPaymentStatusDto> GetStatusAsync(Guid paymentId, Guid organizerId)
    {
        var payment = await _context.SubscriptionPayments.Include(x => x.Plan)
            .FirstOrDefaultAsync(x => x.Id == paymentId && x.OrganizerId == organizerId)
            ?? throw new KeyNotFoundException("Paiement introuvable.");
        if (IsOpen(payment))
            await SyncAsync(payment, await GetSessionStatusAsync(payment.SessionId!));
        return Map(payment);
    }

    public async Task<bool> HandleTransactionSuccessAsync(string transactionId, decimal amount, string currency)
    {
        if (string.IsNullOrWhiteSpace(transactionId)
            || !string.Equals(currency, "XAF", StringComparison.OrdinalIgnoreCase)
            || amount <= 0 || amount != decimal.Truncate(amount) || amount > int.MaxValue)
            return false;

        var since = DateTimeOffset.UtcNow - WebhookLookback;
        var expected = (int)amount;
        var candidates = await _context.SubscriptionPayments.IgnoreQueryFilters().Include(x => x.Plan)
            .Where(x => (x.Status == "PENDING" || x.Status == "CREATED")
                && x.SessionId != null && x.Amount == expected && x.CreatedAt >= since)
            .OrderByDescending(x => x.CreatedAt)
            .Take(WebhookCandidates)
            .ToListAsync();
        foreach (var payment in candidates)
        {
            var session = await GetSessionStatusAsync(payment.SessionId!);
            if (!string.Equals(session.TransactionId, transactionId, StringComparison.Ordinal))
                continue;
            await SyncAsync(payment, session);
            return true;
        }
        return false;
    }

    private static bool IsOpen(SubscriptionPayment payment) =>
        payment.Status is "PENDING" or "CREATED" && !string.IsNullOrWhiteSpace(payment.SessionId);

    // Une tentative refusée laisse la session ouverte (le client peut réessayer sur la page
    // SasPay) : seuls une session expirée ou annulée, ou une transaction confirmée, concluent.
    private async Task SyncAsync(SubscriptionPayment payment, SessionStatus session)
    {
        if (string.Equals(session.TransactionStatus, "SUCCESS", StringComparison.OrdinalIgnoreCase)
            && !string.IsNullOrWhiteSpace(session.TransactionId))
        {
            var transaction = await VerifyTransactionAsync(session.TransactionId);
            if (!string.Equals(transaction.Status, "SUCCESS", StringComparison.OrdinalIgnoreCase))
                return;
            if (!AmountEquals(transaction.RequestedAmount, payment.Amount)
                || !string.Equals(transaction.Currency, "XAF", StringComparison.OrdinalIgnoreCase))
                throw new PaymentProviderException(
                    $"Paiement {payment.Id:D} : la transaction SasPay {session.TransactionId} ne correspond pas (montant ou devise).");
            await ApplyStatusAsync(payment, "SUCCESSFUL");
            return;
        }

        var status = session.Status?.ToUpperInvariant() switch
        {
            "EXPIRED" => "EXPIRED",
            "CANCELLED" or "CANCELED" => "FAILED",
            _ => null,
        };
        if (status != null)
            await ApplyStatusAsync(payment, status);
    }

    private async Task<SessionStatus> GetSessionStatusAsync(string sessionId)
    {
        using var message = new HttpRequestMessage(HttpMethod.Get,
            $"{ApiBaseUrl}/checkout-sessions/{Uri.EscapeDataString(sessionId)}/status/");
        return await SendAsync<SessionStatus>(message, "la vérification du paiement");
    }

    private async Task<VerifiedTransaction> VerifyTransactionAsync(string transactionId)
    {
        using var message = new HttpRequestMessage(HttpMethod.Get,
            $"{ApiBaseUrl}/payments/{Uri.EscapeDataString(transactionId)}/verify/");
        return await SendAsync<VerifiedTransaction>(message, "la vérification du paiement");
    }

    private static SasPayCheckoutDto ReuseCheckout(SubscriptionPayment payment, Guid planId)
    {
        if (payment.PlanId != planId)
            throw new IdempotencyConflictException(
                "Cette clé d’idempotence a déjà été utilisée pour une autre offre.");
        if (string.IsNullOrWhiteSpace(payment.CheckoutUrl))
            throw new IdempotencyConflictException(
                $"La demande de paiement existe déjà mais son résultat est incertain (référence {payment.ExternalId}). Vérifiez cette référence dans SasPay avant d’en créer un autre.");
        return new SasPayCheckoutDto { PaymentId = payment.Id, CheckoutUrl = payment.CheckoutUrl };
    }

    private async Task ApplyStatusAsync(SubscriptionPayment payment, string status)
    {
        if (payment.Status == "SUCCESSFUL" || status == payment.Status) return;
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
                PaymentId = payment.Id, Status = SubscriptionStatus.Actif, StartedAt = now,
                EndsAt = plan.Billing switch
                {
                    PlanBilling.Mensuel => now.AddMonths(1),
                    PlanBilling.Annuel => now.AddYears(1),
                    _ => null,
                },
            });
            payment.PaidAt = now;
        }
        try
        {
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch (DbUpdateException) when (status == "SUCCESSFUL")
        {
            // Webhook et retour du client au même instant : l'index unique sur le paiement
            // a laissé passer une seule activation. Si c'est l'autre requête qui l'a faite,
            // le résultat est le même.
            await transaction.RollbackAsync();
            _context.ChangeTracker.Clear();
            var stored = await _context.SubscriptionPayments.IgnoreQueryFilters().AsNoTracking()
                .Where(x => x.Id == payment.Id).Select(x => x.Status).FirstOrDefaultAsync();
            if (stored != "SUCCESSFUL") throw;
        }
    }

    // Toutes les réponses SasPay ont la forme { success, code, data | error }.
    private async Task<T> SendAsync<T>(HttpRequestMessage message, string action)
    {
        AddApiCredentials(message);
        using var response = await _httpClient.SendAsync(message);
        var body = await response.Content.ReadAsStringAsync();
        JsonDocument? document = null;
        try
        {
            document = JsonDocument.Parse(string.IsNullOrWhiteSpace(body) ? "null" : body);
        }
        catch (JsonException)
        {
            // Une réponse non JSON n'est ni sûre ni utile à recopier dans les journaux.
        }

        using (document)
        {
            var root = document?.RootElement;
            var succeeded = response.IsSuccessStatusCode
                && root is { ValueKind: JsonValueKind.Object } obj
                && (!obj.TryGetProperty("success", out var flag) || flag.ValueKind != JsonValueKind.False);
            if (!succeeded)
            {
                var providerMessage = root.HasValue ? ReadProviderError(root.Value) : null;
                var detail = string.IsNullOrWhiteSpace(providerMessage) ? string.Empty : $" Détail SasPay : {providerMessage}";
                throw new PaymentProviderException(
                    $"SasPay a refusé {action} (HTTP {(int)response.StatusCode}).{detail}",
                    response.StatusCode);
            }

            var data = root!.Value.TryGetProperty("data", out var inner) ? inner : root.Value;
            return data.Deserialize<T>()
                ?? throw new PaymentProviderException("Réponse SasPay invalide.");
        }
    }

    private static string? ReadProviderError(JsonElement root)
    {
        if (root.ValueKind != JsonValueKind.Object) return null;
        var source = root.TryGetProperty("error", out var error) ? error : root;
        if (source.ValueKind == JsonValueKind.String) return Trim(source.GetString());
        if (source.ValueKind != JsonValueKind.Object) return null;
        foreach (var name in new[] { "message", "detail", "code" })
        {
            if (source.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.String)
                return Trim(value.GetString());
        }
        return null;
    }

    private static string? Trim(string? message)
    {
        message = message?.Trim();
        if (string.IsNullOrEmpty(message)) return null;
        return message.Length > 300 ? message[..300] : message;
    }

    private void AddApiCredentials(HttpRequestMessage message)
    {
        var secretKey = _configuration["SasPay:SecretKey"];
        if (string.IsNullOrWhiteSpace(secretKey))
            throw new PaymentProviderException("La clé secrète SasPay n'est pas configurée (SasPay:SecretKey).");
        var allowLive = _configuration.GetValue("SasPay:AllowLive", false);
        if (!secretKey.StartsWith("sk_test_", StringComparison.Ordinal)
            && !(allowLive && secretKey.StartsWith("sk_live_", StringComparison.Ordinal)))
            throw new PaymentProviderException("SasPay est limité aux clés de test : une clé sk_live_ demande SasPay:AllowLive=true.");
        message.Headers.TryAddWithoutValidation("Authorization", $"Bearer {secretKey}");
    }

    private static bool IsSasPayCheckoutUrl(string? url) =>
        Uri.TryCreate(url, UriKind.Absolute, out var uri)
        && uri.Scheme == Uri.UriSchemeHttps
        && (uri.Host.Equals("saspay.me", StringComparison.OrdinalIgnoreCase)
            || uri.Host.EndsWith(".saspay.me", StringComparison.OrdinalIgnoreCase));

    private static string FormatAmount(int amount) => amount.ToString("0.00", CultureInfo.InvariantCulture);

    // SasPay écrit les montants en texte (« 5000.00 ») ; un nombre JSON est aussi accepté.
    private static bool AmountEquals(decimal? amount, int expected) => amount == expected;

    private static SasPayPaymentStatusDto Map(SubscriptionPayment payment) => new()
    {
        PaymentId = payment.Id, Status = payment.Status, PlanLabel = payment.Plan?.Label ?? string.Empty,
        Amount = payment.Amount, CreatedAt = payment.CreatedAt, PaidAt = payment.PaidAt,
    };

    private sealed class CheckoutSessionRequest
    {
        [JsonPropertyName("amount")] public string Amount { get; init; } = string.Empty;
        [JsonPropertyName("currency")] public string Currency { get; init; } = "XAF";
        [JsonPropertyName("country")] public string Country { get; init; } = "CM";
        [JsonPropertyName("customer_email")] public string CustomerEmail { get; init; } = string.Empty;
        [JsonPropertyName("customer_name")] public string CustomerName { get; init; } = string.Empty;
        [JsonPropertyName("description")] public string Description { get; init; } = string.Empty;
        [JsonPropertyName("return_url")] public string ReturnUrl { get; init; } = string.Empty;
        [JsonPropertyName("metadata")] public Dictionary<string, string> Metadata { get; init; } = new();
    }

    private sealed class CheckoutSession
    {
        [JsonPropertyName("id")] public string Id { get; init; } = string.Empty;
        [JsonPropertyName("checkout_url")] public string CheckoutUrl { get; init; } = string.Empty;
        [JsonPropertyName("amount"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
        public decimal? Amount { get; init; }
        [JsonPropertyName("currency")] public string? Currency { get; init; }
        [JsonPropertyName("status")] public string? Status { get; init; }
    }

    private sealed class SessionStatus
    {
        [JsonPropertyName("status")] public string? Status { get; init; }
        [JsonPropertyName("transaction_id")] public string? TransactionId { get; init; }
        [JsonPropertyName("transaction_status")] public string? TransactionStatus { get; init; }
    }

    private sealed class VerifiedTransaction
    {
        [JsonPropertyName("id")] public string? Id { get; init; }
        [JsonPropertyName("status")] public string? Status { get; init; }
        [JsonPropertyName("requested_amount"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
        public decimal? RequestedAmount { get; init; }
        [JsonPropertyName("currency")] public string? Currency { get; init; }
    }
}
