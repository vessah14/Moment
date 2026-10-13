using System.Net;
using System.Security.Claims;
using System.Text.Json;
using backend_EventMoment.Data;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;

namespace backend_EventMoment.Tests;

// Réponses conformes à la documentation Notch Pay : « reference » est la référence Notch Pay
// (trx.…), « trxref » celle que nous avons envoyée à l'initialisation.
public class NotchPayPaymentServiceTests
{
    private static readonly Guid PlanId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

    [Fact]
    public async Task CreateCheckoutAsync_UsesPlanPriceAndReturnsHostedLink()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var handler = new StubHandler(async request =>
        {
            using var body = JsonDocument.Parse(await request.Content!.ReadAsStringAsync());
            var trxref = body.RootElement.GetProperty("reference").GetString();
            return JsonResponse(JsonSerializer.Serialize(new
            {
                status = "Accepted",
                transaction = new { reference = "trx.test_1", trxref, amount = 9900, currency = "XAF", status = "pending" },
                authorization_url = "https://pay.notchpay.co/pay/trx.test_1",
            }));
        });
        var service = CreateService(context, handler);

        var checkout = await service.CreateCheckoutAsync(organizerId, PlanId);

        Assert.Equal("https://pay.notchpay.co/pay/trx.test_1", checkout.CheckoutUrl);
        var request = handler.Requests.Single();
        using var requestBody = JsonDocument.Parse(request.Body);
        Assert.Equal(9900, requestBody.RootElement.GetProperty("amount").GetInt32());
        Assert.Equal("XAF", requestBody.RootElement.GetProperty("currency").GetString());
        Assert.Equal("buyer@example.com", requestBody.RootElement.GetProperty("customer").GetProperty("email").GetString());
        Assert.StartsWith("https://moment.example/dashboard/parametres?tab=billing&paymentId=",
            requestBody.RootElement.GetProperty("callback").GetString());
        Assert.Equal("test_api_key", request.Authorization);
        Assert.Equal("https://api.notchpay.co/payments", request.Uri);

        var saved = await context.NotchPayPayments.SingleAsync();
        Assert.Equal(organizerId, saved.OrganizerId);
        Assert.Equal("trx.test_1", saved.TransactionId);
        Assert.Equal("PENDING", saved.Status);
    }

    [Fact]
    public async Task CreateCheckoutAsync_RejectsATransactionForAnotherReference()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(JsonResponse(
            """{"transaction":{"reference":"trx.x","trxref":"autre","amount":9900,"currency":"XAF","status":"pending"},"authorization_url":"https://pay.notchpay.co/x"}""")));

        await Assert.ThrowsAsync<HttpRequestException>(() => CreateService(context, handler).CreateCheckoutAsync(organizerId, PlanId));
        Assert.Equal("FAILED", (await context.NotchPayPayments.SingleAsync()).Status);
    }

    [Fact]
    public async Task HandleWebhookAsync_ActivatesPlanOnlyOnce_AfterVerifyingWithNotchPayReference()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        SeedPendingPayment(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(JsonResponse(
            """{"transaction":{"reference":"trx.test_1","trxref":"external-1","status":"complete","amount":9900,"currency":"XAF"}}""")));
        var service = CreateService(context, handler);

        Assert.True(await service.HandleWebhookAsync("trx.test_1", "external-1"));
        Assert.True(await service.HandleWebhookAsync("trx.test_1"));

        Assert.Single(await context.OrganizerSubscriptions.ToListAsync());
        Assert.Equal("SUCCESSFUL", (await context.NotchPayPayments.SingleAsync()).Status);
        // Vérification auprès de Notch Pay avec SA référence (exigé par la documentation).
        Assert.All(handler.Requests, r => Assert.Equal("https://api.notchpay.co/payments/trx.test_1", r.Uri));
    }

    [Fact]
    public async Task HandleWebhookAsync_DoesNotActivateWhenNotchPayAmountDiffers()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        SeedPendingPayment(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(JsonResponse(
            """{"transaction":{"reference":"trx.test_1","trxref":"external-1","status":"complete","amount":100,"currency":"XAF"}}""")));

        await Assert.ThrowsAsync<InvalidOperationException>(() => CreateService(context, handler).HandleWebhookAsync("trx.test_1"));
        Assert.Empty(await context.OrganizerSubscriptions.ToListAsync());
    }

    [Fact]
    public async Task PendingOrUnknownStatus_DoesNotActivate_AndUnknownPaymentIsIgnored()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        SeedPendingPayment(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(JsonResponse(
            """{"transaction":{"reference":"trx.test_1","trxref":"external-1","status":"processing","amount":"9900.00","currency":"XAF"}}""")));
        var service = CreateService(context, handler);

        Assert.True(await service.HandleWebhookAsync("trx.test_1"));
        Assert.False(await service.HandleWebhookAsync("trx.inconnue"));

        Assert.Empty(await context.OrganizerSubscriptions.ToListAsync());
        Assert.Equal("PENDING", (await context.NotchPayPayments.SingleAsync()).Status);
    }

    private static void SeedPendingPayment(AdminDbContext context, Guid organizerId)
    {
        context.NotchPayPayments.Add(new NotchPayPayment
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            PlanId = PlanId,
            ExternalId = "external-1",
            TransactionId = "trx.test_1",
            Amount = 9900,
            Status = "PENDING",
        });
        context.SaveChanges();
    }

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
        context.SaveChanges();
    }

    private static NotchPayPaymentService CreateService(AdminDbContext context, StubHandler handler)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["NotchPay:ApiKey"] = "test_api_key",
                ["Frontend:BaseUrl"] = "https://moment.example",
            })
            .Build();
        return new NotchPayPaymentService(context, config, new StubHttpClientFactory(handler));
    }

    private static HttpResponseMessage JsonResponse(string json) => new(HttpStatusCode.OK)
    {
        Content = new StringContent(json),
    };

    private sealed class StubHttpClientFactory(StubHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, disposeHandler: false);
    }

    private sealed class StubHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> respond) : HttpMessageHandler
    {
        public List<(string Body, string? Authorization, string Uri)> Requests { get; } = [];

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var body = request.Content == null ? string.Empty : await request.Content.ReadAsStringAsync(cancellationToken);
            Requests.Add((body,
                request.Headers.TryGetValues("Authorization", out var authorization) ? authorization.Single() : null,
                request.RequestUri!.ToString()));
            return await respond(request);
        }
    }
}
