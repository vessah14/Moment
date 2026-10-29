using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using backend_EventMoment.Controllers;
using backend_EventMoment.Data;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using backend_EventMoment.Services.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;

namespace backend_EventMoment.Tests;

public sealed class SasPayPaymentServiceTests
{
    private static readonly Guid PlanId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static readonly Guid IdempotencyKey = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    private const string CheckoutUrl = "https://pay.saspay.me/checkout/kZ2v9rT4bQxL8mNpYw==";

    [Fact]
    public async Task CreateCheckoutAsync_SendsXafForCameroonAndReturnsHostedLink()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(SessionCreated()));

        var checkout = await CreateService(context, handler)
            .CreateCheckoutAsync(organizerId, PlanId, IdempotencyKey);

        Assert.Equal(CheckoutUrl, checkout.CheckoutUrl);
        var request = handler.Requests.Single();
        Assert.Equal("https://api.saspay.me/api/v1/checkout-sessions/", request.Uri);
        Assert.Equal("Bearer sk_test_key", request.Authorization);
        using var body = JsonDocument.Parse(request.Body);
        Assert.Equal("9900.00", body.RootElement.GetProperty("amount").GetString());
        Assert.Equal("XAF", body.RootElement.GetProperty("currency").GetString());
        Assert.Equal("CM", body.RootElement.GetProperty("country").GetString());
        Assert.Equal("buyer@example.com", body.RootElement.GetProperty("customer_email").GetString());
        Assert.Equal("Buyer", body.RootElement.GetProperty("customer_name").GetString());
        var payment = await context.SubscriptionPayments.SingleAsync();
        Assert.Equal(
            $"https://moment.example/dashboard/parametres?tab=billing&paymentId={payment.Id:D}",
            body.RootElement.GetProperty("return_url").GetString());
        Assert.Equal("sess_1", payment.SessionId);
        Assert.Equal("PENDING", payment.Status);
        Assert.Equal(IdempotencyKey, payment.IdempotencyKey);
    }

    [Fact]
    public async Task CreateCheckoutAsync_ReusesCheckoutForSameIdempotencyKey()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(SessionCreated()));
        var service = CreateService(context, handler);

        var first = await service.CreateCheckoutAsync(organizerId, PlanId, IdempotencyKey);
        var replay = await service.CreateCheckoutAsync(organizerId, PlanId, IdempotencyKey);

        Assert.Equal(first.PaymentId, replay.PaymentId);
        Assert.Equal(first.CheckoutUrl, replay.CheckoutUrl);
        Assert.Single(handler.Requests);
    }

    [Fact]
    public async Task CreateCheckoutAsync_RejectsReusingKeyForAnotherPlan()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(SessionCreated()));
        var service = CreateService(context, handler);
        await service.CreateCheckoutAsync(organizerId, PlanId, IdempotencyKey);

        await Assert.ThrowsAsync<IdempotencyConflictException>(() =>
            service.CreateCheckoutAsync(organizerId, Guid.NewGuid(), IdempotencyKey));
        Assert.Single(handler.Requests);
    }

    [Fact]
    public async Task CreateCheckoutAsync_RejectsCheckoutUrlOutsideSasPay()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(SessionCreated("https://evil.example/checkout")));

        await Assert.ThrowsAsync<HttpRequestException>(() =>
            CreateService(context, handler).CreateCheckoutAsync(organizerId, PlanId, IdempotencyKey));

        Assert.Equal("FAILED", (await context.SubscriptionPayments.SingleAsync()).Status);
    }

    [Fact]
    public async Task CreateCheckoutAsync_IncludesSasPayErrorAndHttpStatusInServerException()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(Json(HttpStatusCode.Forbidden,
            """{"success":false,"error":{"message":"Clé sans portée PAYIN","code":"api_key_scope_forbidden"},"code":403}""")));

        var error = await Assert.ThrowsAsync<HttpRequestException>(() =>
            CreateService(context, handler).CreateCheckoutAsync(organizerId, PlanId, IdempotencyKey));

        Assert.Equal(HttpStatusCode.Forbidden, error.StatusCode);
        Assert.Contains("HTTP 403", error.Message);
        Assert.Contains("Clé sans portée PAYIN", error.Message);
        Assert.Equal("FAILED", (await context.SubscriptionPayments.SingleAsync()).Status);
        await Assert.ThrowsAsync<IdempotencyConflictException>(() =>
            CreateService(context, handler).CreateCheckoutAsync(organizerId, PlanId, IdempotencyKey));
        Assert.Single(handler.Requests);
    }

    [Fact]
    public async Task CreateCheckoutAsync_RefusesLiveKeyUnlessAllowed()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(SessionCreated()));

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            CreateService(context, handler, secretKey: "sk_live_key")
                .CreateCheckoutAsync(organizerId, PlanId, IdempotencyKey));
        Assert.Empty(handler.Requests);
    }

    [Fact]
    public async Task GetStatusAsync_ActivatesPlanOnceTransactionIsVerified()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var payment = SeedPendingPayment(context, organizerId);
        var handler = new StubHandler(request => Task.FromResult(request.RequestUri!.AbsolutePath switch
        {
            "/api/v1/checkout-sessions/sess_1/status/" => SessionStatus("PAID", "tx_1", "SUCCESS"),
            "/api/v1/payments/tx_1/verify/" => Verified("SUCCESS", "9900.00"),
            _ => throw new InvalidOperationException(request.RequestUri.ToString()),
        }));

        var status = await CreateService(context, handler).GetStatusAsync(payment.Id, organizerId);

        Assert.Equal("SUCCESSFUL", status.Status);
        var subscription = Assert.Single(await context.OrganizerSubscriptions.ToListAsync());
        Assert.Equal(payment.Id, subscription.PaymentId);
        Assert.Equal(SubscriptionStatus.Actif, subscription.Status);
    }

    [Fact]
    public async Task GetStatusAsync_KeepsPaymentOpenAfterFailedAttempt()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var payment = SeedPendingPayment(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(SessionStatus("PENDING", "tx_1", "FAILED")));

        var status = await CreateService(context, handler).GetStatusAsync(payment.Id, organizerId);

        Assert.Equal("PENDING", status.Status);
        Assert.Empty(await context.OrganizerSubscriptions.ToListAsync());
    }

    [Fact]
    public async Task GetStatusAsync_MapsExpiredSessionWithoutActivatingPlan()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var payment = SeedPendingPayment(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(SessionStatus("EXPIRED", null, null)));

        var status = await CreateService(context, handler).GetStatusAsync(payment.Id, organizerId);

        Assert.Equal("EXPIRED", status.Status);
        Assert.Empty(await context.OrganizerSubscriptions.ToListAsync());
    }

    [Fact]
    public async Task GetStatusAsync_RejectsVerifiedAmountNotMatchingPayment()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var payment = SeedPendingPayment(context, organizerId);
        var handler = new StubHandler(request => Task.FromResult(request.RequestUri!.AbsolutePath.EndsWith("/verify/")
            ? Verified("SUCCESS", "100.00")
            : SessionStatus("PAID", "tx_1", "SUCCESS")));

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            CreateService(context, handler).GetStatusAsync(payment.Id, organizerId));

        Assert.Equal("PENDING", (await context.SubscriptionPayments.SingleAsync()).Status);
        Assert.Empty(await context.OrganizerSubscriptions.ToListAsync());
    }

    [Fact]
    public async Task HandleTransactionSuccessAsync_FindsSessionAndActivatesOnlyOnce()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        SeedPendingPayment(context, organizerId);
        var handler = new StubHandler(request => Task.FromResult(request.RequestUri!.AbsolutePath.EndsWith("/verify/")
            ? Verified("SUCCESS", "9900.00")
            : SessionStatus("PAID", "tx_1", "SUCCESS")));
        var service = CreateService(context, handler);

        Assert.True(await service.HandleTransactionSuccessAsync("tx_1", 9900m, "XAF"));
        // Rejeu du même webhook : le paiement n'est plus en attente, rien à refaire.
        Assert.False(await service.HandleTransactionSuccessAsync("tx_1", 9900m, "XAF"));

        Assert.Equal("SUCCESSFUL", (await context.SubscriptionPayments.SingleAsync()).Status);
        Assert.Single(await context.OrganizerSubscriptions.ToListAsync());
    }

    [Fact]
    public async Task HandleTransactionSuccessAsync_IgnoresOtherAmountsWithoutQueryingSasPay()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        SeedPendingPayment(context, organizerId);
        var handler = new StubHandler(_ => throw new InvalidOperationException(
            "SasPay must not be queried for a transaction with another amount."));

        var accepted = await CreateService(context, handler).HandleTransactionSuccessAsync("tx_1", 100m, "XAF");

        Assert.False(accepted);
        Assert.Equal("PENDING", (await context.SubscriptionPayments.SingleAsync()).Status);
        Assert.Empty(handler.Requests);
    }

    [Fact]
    public async Task HandleTransactionSuccessAsync_IgnoresTransactionOfAnotherSession()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        SeedPendingPayment(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(SessionStatus("PAID", "tx_other", "SUCCESS")));

        var accepted = await CreateService(context, handler).HandleTransactionSuccessAsync("tx_1", 9900m, "XAF");

        Assert.False(accepted);
        Assert.Equal("PENDING", (await context.SubscriptionPayments.SingleAsync()).Status);
        Assert.Single(handler.Requests);
    }

    [Fact]
    public void IsValidSignature_AcceptsSasPaySignatureAndRejectsTamperingOrReplay()
    {
        const string secret = "whsec_test";
        const string body = """{"event":"transaction.success","data":{"id":"tx_1"}}""";
        var now = DateTimeOffset.FromUnixTimeSeconds(1_800_000_000);
        var timestamp = now.ToUnixTimeSeconds().ToString();
        var signature = Convert.ToHexString(HMACSHA256.HashData(
            Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes($"{timestamp}.{body}"))).ToLowerInvariant();

        Assert.True(SasPayPaymentsController.IsValidSignature(body, timestamp, signature, secret, now));
        Assert.False(SasPayPaymentsController.IsValidSignature(body + " ", timestamp, signature, secret, now));
        Assert.False(SasPayPaymentsController.IsValidSignature(body, timestamp, signature, "other", now));
        Assert.False(SasPayPaymentsController.IsValidSignature(body, timestamp, signature, secret, now.AddMinutes(6)));
        Assert.False(SasPayPaymentsController.IsValidSignature(body, timestamp, "not-hex", secret, now));
    }

    private static SubscriptionPayment SeedPendingPayment(AdminDbContext context, Guid organizerId)
    {
        var payment = new SubscriptionPayment
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            PlanId = PlanId,
            ExternalId = "external-1",
            SessionId = "sess_1",
            Amount = 9900,
            Status = "PENDING",
        };
        context.SubscriptionPayments.Add(payment);
        context.SaveChanges();
        return payment;
    }

    private static HttpResponseMessage SessionCreated(string checkoutUrl = CheckoutUrl) => Json(HttpStatusCode.Created,
        JsonSerializer.Serialize(new
        {
            success = true,
            code = 201,
            data = new
            {
                id = "sess_1",
                checkout_url = checkoutUrl,
                amount = "9900.00",
                currency = "XAF",
                status = "PENDING",
            },
        }));

    private static HttpResponseMessage SessionStatus(string status, string? transactionId, string? transactionStatus) =>
        Json(HttpStatusCode.OK, JsonSerializer.Serialize(new
        {
            success = true,
            code = 200,
            data = new { id = "sess_1", status, transaction_id = transactionId, transaction_status = transactionStatus },
        }));

    private static HttpResponseMessage Verified(string status, string requestedAmount) =>
        Json(HttpStatusCode.OK, JsonSerializer.Serialize(new
        {
            success = true,
            code = 200,
            data = new { id = "tx_1", status, requested_amount = requestedAmount, currency = "XAF" },
        }));

    private static AdminDbContext CreateContext(Guid organizerId)
    {
        var options = new DbContextOptionsBuilder<AdminDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, organizerId.ToString()),
                new Claim("type", "organizer"),
            }, "Test")),
        };
        return new AdminDbContext(options, new HttpContextAccessor { HttpContext = httpContext });
    }

    private static void SeedPlanAndOrganizer(AdminDbContext context, Guid organizerId)
    {
        context.SubscriptionPlans.Add(new SubscriptionPlan
        {
            Id = PlanId,
            Code = "premium",
            Label = "Premium",
            PriceCents = 990000,
            Currency = "XAF",
            Billing = PlanBilling.Mensuel,
            Features = "{}",
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
        });
        context.Organizers.Add(new Utilisateur
        {
            Id = organizerId,
            Email = "buyer@example.com",
            PasswordHash = "hash",
            FullName = "Buyer",
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        });
        context.OrganizerEmailVerifications.Add(new OrganizerEmailVerification { OrganizerId = organizerId, VerifiedAt = DateTimeOffset.UtcNow });
        context.SaveChanges();
    }

    private static SasPayPaymentService CreateService(AdminDbContext context, StubHandler handler, string secretKey = "sk_test_key")
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["SasPay:SecretKey"] = secretKey,
                ["Frontend:BaseUrl"] = "https://moment.example",
            })
            .Build();
        return new SasPayPaymentService(context, configuration, new StubHttpClientFactory(handler));
    }

    private static HttpResponseMessage Json(HttpStatusCode status, string json) => new(status)
    {
        Content = new StringContent(json, Encoding.UTF8, "application/json"),
    };

    private sealed class StubHttpClientFactory(StubHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, disposeHandler: false);
    }

    private sealed class StubHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> respond)
        : HttpMessageHandler
    {
        public List<(string Body, string Uri, string? Authorization)> Requests { get; } = [];

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            var body = request.Content == null
                ? string.Empty
                : await request.Content.ReadAsStringAsync(cancellationToken);
            Requests.Add((body, request.RequestUri!.ToString(), request.Headers.Authorization?.ToString()));
            return await respond(request);
        }
    }
}
