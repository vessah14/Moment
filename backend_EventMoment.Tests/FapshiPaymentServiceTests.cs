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

public class NotchPayPaymentServiceTests
{
    [Fact]
    public async Task CreateCheckoutAsync_UsesPlanPriceAndReturnsHostedLink()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var handler = new StubHandler(async request =>
        {
            using var body = JsonDocument.Parse(await request.Content!.ReadAsStringAsync());
            var reference = body.RootElement.GetProperty("reference").GetString();
            return JsonResponse(JsonSerializer.Serialize(new
            {
                transaction = new { id = "pay-1", reference, amount = 9900, currency = "XAF", status = "pending" },
                authorization_url = "https://pay.notchpay.co/pay/1",
            }));
        });
        var service = CreateService(context, handler);

        var checkout = await service.CreateCheckoutAsync(organizerId, Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));

        Assert.Equal("https://pay.notchpay.co/pay/1", checkout.CheckoutUrl);
        using var requestBody = JsonDocument.Parse(handler.Requests.Single().Body);
        Assert.Equal(9900, requestBody.RootElement.GetProperty("amount").GetInt32());
        Assert.Equal("XAF", requestBody.RootElement.GetProperty("currency").GetString());
        Assert.Equal("test_api_key", handler.Requests.Single().Authorization);
        Assert.Equal("https://api.notchpay.co/payments", handler.Requests.Single().Uri);

        var saved = await context.NotchPayPayments.SingleAsync();
        Assert.Equal(organizerId, saved.OrganizerId);
        Assert.Equal("pay-1", saved.TransactionId);
        Assert.Equal("PENDING", saved.Status);
    }

    [Fact]
    public async Task HandleWebhookAsync_ActivatesPlanOnlyOnceAfterNotchPayConfirmsAmount()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        context.NotchPayPayments.Add(new NotchPayPayment
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            PlanId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            ExternalId = "external-1",
            TransactionId = "trans-1",
            Amount = 9900,
            Status = "PENDING",
        });
        await context.SaveChangesAsync();
        var handler = new StubHandler(_ => Task.FromResult(JsonResponse("""{"transaction":{"id":"pay-1","reference":"external-1","status":"complete","amount":9900,"currency":"XAF"}}""")));
        var service = CreateService(context, handler);

        Assert.True(await service.HandleWebhookAsync("external-1"));
        Assert.True(await service.HandleWebhookAsync("external-1"));

        Assert.Single(await context.OrganizerSubscriptions.ToListAsync());
        Assert.Equal("SUCCESSFUL", (await context.NotchPayPayments.SingleAsync()).Status);
    }

    [Fact]
    public async Task HandleWebhookAsync_DoesNotActivateWhenNotchPayAmountDiffers()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        context.NotchPayPayments.Add(new NotchPayPayment
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            PlanId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            ExternalId = "external-1",
            TransactionId = "trans-1",
            Amount = 9900,
            Status = "PENDING",
        });
        await context.SaveChangesAsync();
        var handler = new StubHandler(_ => Task.FromResult(JsonResponse("""{"transaction":{"id":"pay-1","reference":"external-1","status":"complete","amount":100,"currency":"XAF"}}""")));
        var service = CreateService(context, handler);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.HandleWebhookAsync("external-1"));
        Assert.Empty(await context.OrganizerSubscriptions.ToListAsync());
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
            Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
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