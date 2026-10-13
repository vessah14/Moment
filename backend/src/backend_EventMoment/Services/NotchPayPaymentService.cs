using System.Net.Http.Json;
using System.Text.Json.Serialization;
using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services;

public class NotchPayPaymentService : INotchPayPaymentService
{
    private const string ApiBaseUrl = "https://api.notchpay.co";
    private readonly AdminDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public NotchPayPaymentService(AdminDbContext context, IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient();
    }

    public async Task<NotchPayCheckoutDto> CreateCheckoutAsync(Guid organizerId, Guid planId)
    {
        var plan = await _context.SubscriptionPlans.FirstOrDefaultAsync(x => x.Id == planId && x.IsActive)
            ?? throw new KeyNotFoundException("Offre introuvable.");
        if (plan.PriceCents <= 0 || plan.PriceCents % 100 != 0)
            throw new InvalidOperationException("Cette offre ne peut pas être payée en ligne.");

        var organizer = await _context.Organizers.FirstOrDefaultAsync(x => x.Id == organizerId)
            ?? throw new KeyNotFoundException("Compte introuvable.");
        var payment = new NotchPayPayment
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            PlanId = plan.Id,
            ExternalId = Guid.NewGuid().ToString("N"),
            Amount = plan.PriceCents / 100,
        };
        _context.NotchPayPayments.Add(payment);
        await _context.SaveChangesAsync();

        try
        {
            var frontendUrl = _configuration["Frontend:BaseUrl"]?.TrimEnd('/')
                ?? throw new InvalidOperationException("Frontend:BaseUrl n'est pas configurée.");
            var request = new InitializePaymentRequest
            {
                Amount = payment.Amount,
                Currency = "XAF",
                Customer = new CustomerDetails { Name = organizer.FullName, Email = organizer.Email },
                Description = $"Abonnement {plan.Label}",
                Callback = $"{frontendUrl}/dashboard/parametres?tab=billing&paymentId={payment.Id:D}",
                Reference = payment.ExternalId,
            };

            using var message = new HttpRequestMessage(HttpMethod.Post, $"{ApiBaseUrl}/payments")
            {
                Content = JsonContent.Create(request),
            };
            AddApiKey(message);
            using var response = await _httpClient.SendAsync(message);
            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException("Notch Pay a refusé la création du paiement.");

            var result = await response.Content.ReadFromJsonAsync<NotchPayApiResponse>()
                ?? throw new HttpRequestException("Réponse Notch Pay invalide.");
            // Notch Pay renvoie sa propre référence (« trx.… », dans reference) et la nôtre
            // (dans trxref) : c'est la sienne qui sert ensuite à vérifier le paiement.
            var remote = result.Transaction;
            if (remote == null
                || string.IsNullOrWhiteSpace(remote.Reference)
                || !string.Equals(remote.MerchantReference, payment.ExternalId, StringComparison.Ordinal)
                || remote.Amount != payment.Amount
                || !string.Equals(remote.Currency, "XAF", StringComparison.OrdinalIgnoreCase)
                || !Uri.TryCreate(result.AuthorizationUrl, UriKind.Absolute, out var checkoutUri)
                || checkoutUri.Scheme != Uri.UriSchemeHttps)
                throw new HttpRequestException("Notch Pay a retourné une transaction ou un lien invalide.");

            payment.TransactionId = remote.Reference;
            payment.CheckoutUrl = result.AuthorizationUrl;
            payment.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            return new NotchPayCheckoutDto { PaymentId = payment.Id, CheckoutUrl = payment.CheckoutUrl };
        }
        catch
        {
            payment.Status = "FAILED";
            payment.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            throw;
        }
    }

    public async Task<NotchPayPaymentStatusDto> GetStatusAsync(Guid paymentId, Guid organizerId)
    {
        var payment = await _context.NotchPayPayments
            .Include(x => x.Plan)
            .FirstOrDefaultAsync(x => x.Id == paymentId && x.OrganizerId == organizerId)
            ?? throw new KeyNotFoundException("Paiement introuvable.");
        if (payment.Status is "PENDING" or "CREATED" && !string.IsNullOrWhiteSpace(payment.TransactionId))
        {
            var remote = await GetRemoteStatusAsync(payment.TransactionId);
            await ApplyRemoteStatusAsync(payment, remote);
        }
        return Map(payment);
    }

    // Le webhook ne fait que signaler un changement : le statut retenu est toujours celui
    // relu auprès de l'API Notch Pay (jamais celui du message lui-même).
    public async Task<bool> HandleWebhookAsync(string notchReference, string? merchantReference = null)
    {
        if (string.IsNullOrWhiteSpace(notchReference) && string.IsNullOrWhiteSpace(merchantReference))
            return false;
        var payment = await _context.NotchPayPayments.IgnoreQueryFilters()
            .Include(x => x.Plan)
            .FirstOrDefaultAsync(x => (notchReference != "" && x.TransactionId == notchReference)
                || (merchantReference != null && merchantReference != "" && x.ExternalId == merchantReference));
        if (payment == null || string.IsNullOrWhiteSpace(payment.TransactionId))
            return false;
        var remote = await GetRemoteStatusAsync(payment.TransactionId);
        await ApplyRemoteStatusAsync(payment, remote);
        return true;
    }

    private async Task ApplyRemoteStatusAsync(NotchPayPayment payment, RemoteTransaction remote)
    {
        if (!string.Equals(payment.TransactionId, remote.Reference, StringComparison.Ordinal)
            || (!string.IsNullOrEmpty(remote.MerchantReference)
                && !string.Equals(payment.ExternalId, remote.MerchantReference, StringComparison.Ordinal))
            || payment.Amount != remote.Amount
            || !string.Equals(remote.Currency, "XAF", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Les informations de paiement Notch Pay ne correspondent pas.");
        if (payment.Status == "SUCCESSFUL")
            return;

        var status = remote.Status.ToLowerInvariant() switch
        {
            "complete" => "SUCCESSFUL",
            "failed" or "canceled" or "cancelled" => "FAILED",
            "expired" => "EXPIRED",
            // pending, processing… ou statut non documenté : on attend la suite.
            _ => "PENDING",
        };
        if (status == payment.Status)
            return;

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
                Id = Guid.NewGuid(),
                OrganizerId = payment.OrganizerId,
                PlanId = payment.PlanId,
                NotchPayPaymentId = payment.Id,
                Status = SubscriptionStatus.Actif,
                StartedAt = now,
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

    private async Task<RemoteTransaction> GetRemoteStatusAsync(string reference)
    {
        using var message = new HttpRequestMessage(HttpMethod.Get,
            $"{ApiBaseUrl}/payments/{Uri.EscapeDataString(reference)}");
        AddApiKey(message);
        using var response = await _httpClient.SendAsync(message);
        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException("Impossible de vérifier le paiement auprès de Notch Pay.");
        var result = await response.Content.ReadFromJsonAsync<NotchPayApiResponse>()
            ?? throw new HttpRequestException("Réponse de statut Notch Pay invalide.");
        return result.Transaction
            ?? throw new HttpRequestException("La transaction est absente de la réponse Notch Pay.");
    }

    private void AddApiKey(HttpRequestMessage message)
    {
        var apiKey = _configuration["NotchPay:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("La clé API Notch Pay n'est pas configurée.");
        message.Headers.TryAddWithoutValidation("Authorization", apiKey);
    }

    private static NotchPayPaymentStatusDto Map(NotchPayPayment payment) => new()
    {
        PaymentId = payment.Id,
        Status = payment.Status,
        PlanLabel = payment.Plan?.Label ?? string.Empty,
        Amount = payment.Amount,
        CreatedAt = payment.CreatedAt,
        PaidAt = payment.PaidAt,
    };

    private sealed class InitializePaymentRequest
    {
        public int Amount { get; init; }
        public string Currency { get; init; } = string.Empty;
        public CustomerDetails Customer { get; init; } = new();
        public string Description { get; init; } = string.Empty;
        public string Callback { get; init; } = string.Empty;
        public string Reference { get; init; } = string.Empty;
    }

    private sealed class CustomerDetails
    {
        public string Name { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
    }

    private sealed class NotchPayApiResponse
    {
        [JsonPropertyName("transaction")]
        public RemoteTransaction? Transaction { get; init; }
        [JsonPropertyName("authorization_url")]
        public string AuthorizationUrl { get; init; } = string.Empty;
    }

    private sealed class RemoteTransaction
    {
        [JsonPropertyName("id")]
        public string Id { get; init; } = string.Empty;
        // Référence Notch Pay (« trx.… »).
        [JsonPropertyName("reference")]
        public string Reference { get; init; } = string.Empty;
        // Notre référence, transmise à l'initialisation.
        [JsonPropertyName("trxref")]
        public string? MerchantReference { get; init; }
        [JsonPropertyName("status")]
        public string Status { get; init; } = string.Empty;
        // Montant en XAF (sans centimes) ; Notch Pay peut l'écrire 9900 ou 9900.00.
        [JsonPropertyName("amount")]
        [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
        public decimal Amount { get; init; }
        [JsonPropertyName("currency")]
        public string Currency { get; init; } = string.Empty;
    }
}