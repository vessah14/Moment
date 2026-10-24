using System.Net;
using System.Security.Claims;
using System.Text.Json;
using backend_EventMoment.Data;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using backend_EventMoment.Services.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;

namespace backend_EventMoment.Tests;

public sealed class KPayPaymentServiceTests
{
    private static readonly Guid PlanId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static readonly Guid IdempotencyKey = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    [Fact]
    public async Task CreateCheckoutAsync_SendsXafAndReturnsHostedLink()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var handler = new StubHandler(async request =>
        {
            using var requestBody = JsonDocument.Parse(
                await request.Content!.ReadAsStringAsync());
            var externalId = requestBody.RootElement.GetProperty("externalId").GetString();
            return JsonResponse(JsonSerializer.Serialize(new
            {
                id = "kpay_1",
                externalId,
                status = "PENDING",
                amount = 9900,
                currency = "XAF",
                gatewayUrl = "https://pay.kpay.site/checkout/kpay_1",
            }));
        });

        var checkout = await CreateService(context, handler)
            .CreateCheckoutAsync(organizerId, PlanId, IdempotencyKey);

        Assert.Equal("https://pay.kpay.site/checkout/kpay_1", checkout.CheckoutUrl);
        using var requestBody = JsonDocument.Parse(handler.Requests.Single().Body);
        Assert.Equal(9900, requestBody.RootElement.GetProperty("amount").GetInt32());
        Assert.Equal("XAF", requestBody.RootElement.GetProperty("currency").GetString());
        Assert.Equal("buyer@example.com", requestBody.RootElement.GetProperty("customerEmail").GetString());
        Assert.Equal(IdempotencyKey, (await context.KPayPayments.SingleAsync()).IdempotencyKey);
    }

    [Fact]
    public async Task CreateCheckoutAsync_ReusesCheckoutForSameIdempotencyKey()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var handler = new StubHandler(async request =>
        {
            using var requestBody = JsonDocument.Parse(await request.Content!.ReadAsStringAsync());
            var externalId = requestBody.RootElement.GetProperty("externalId").GetString();
            return JsonResponse(JsonSerializer.Serialize(new
            {
                id = "kpay_1",
                externalId,
                status = "PENDING",
                amount = 9900,
                currency = "XAF",
                gatewayUrl = "https://pay.kpay.site/checkout/kpay_1",
            }));
        });
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
        var handler = new StubHandler(async request =>
        {
            using var requestBody = JsonDocument.Parse(await request.Content!.ReadAsStringAsync());
            var externalId = requestBody.RootElement.GetProperty("externalId").GetString();
            return JsonResponse(JsonSerializer.Serialize(new
            {
                id = "kpay_1",
                externalId,
                status = "PENDING",
                amount = 9900,
                currency = "XAF",
                gatewayUrl = "https://pay.kpay.site/checkout/kpay_1",
            }));
        });
        var service = CreateService(context, handler);
        await service.CreateCheckoutAsync(organizerId, PlanId, IdempotencyKey);

        await Assert.ThrowsAsync<IdempotencyConflictException>(() =>
            service.CreateCheckoutAsync(organizerId, Guid.NewGuid(), IdempotencyKey));
        Assert.Single(handler.Requests);
    }

    [Fact]
    public async Task GetStatusAsync_MapsExpiredPaymentWithoutActivatingPlan()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        context.KPayPayments.Add(new KPayPayment
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            PlanId = PlanId,
            ExternalId = "external-1",
            TransactionId = "kpay_1",
            Amount = 9900,
            Status = "PENDING",
        });
        await context.SaveChangesAsync();

        var handler = new StubHandler(_ => Task.FromResult(JsonResponse(
            """{"id":"kpay_1","externalId":"external-1","status":"EXPIRED","amount":9900,"currency":"XAF","gatewayUrl":"https://pay.kpay.site/checkout/kpay_1"}""")));

        var status = await CreateService(context, handler)
            .GetStatusAsync((await context.KPayPayments.SingleAsync()).Id, organizerId);

        Assert.Equal("EXPIRED", status.Status);
        Assert.Equal("EXPIRED", (await context.KPayPayments.SingleAsync()).Status);
        Assert.Empty(await context.OrganizerSubscriptions.ToListAsync());
    }

    [Fact]
    public async Task HandleWebhookAsync_ConfirmsWithKPayAndActivatesOnlyOnce()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        context.KPayPayments.Add(new KPayPayment
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            PlanId = PlanId,
            ExternalId = "external-1",
            TransactionId = "kpay_1",
            Amount = 9900,
            Status = "PENDING",
        });
        await context.SaveChangesAsync();
        var handler = new StubHandler(_ => Task.FromResult(JsonResponse(
            """{"id":"kpay_1","externalId":"external-1","status":"SUCCESSFUL","amount":9900,"currency":"XAF","gatewayUrl":"https://pay.kpay.site/checkout/kpay_1"}""")));
        var service = CreateService(context, handler);

        Assert.True(await service.HandleWebhookAsync("kpay_1", "external-1", "SUCCESSFUL", 9900));
        Assert.True(await service.HandleWebhookAsync("kpay_1", "external-1", "SUCCESSFUL", 9900));

        Assert.Equal("SUCCESSFUL", (await context.KPayPayments.SingleAsync()).Status);
        Assert.Single(await context.OrganizerSubscriptions.ToListAsync());
        Assert.Equal(2, handler.Requests.Count);
    }

    [Fact]
    public async Task CreateCheckoutAsync_IncludesKPayErrorAndHttpStatusInServerException()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        var handler = new StubHandler(_ => Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest)
        {
            Content = new StringContent("""{"message":"returnUrl must be HTTPS"}"""),
        }));

        var error = await Assert.ThrowsAsync<HttpRequestException>(() =>
            CreateService(context, handler).CreateCheckoutAsync(organizerId, PlanId, IdempotencyKey));

        Assert.Equal(HttpStatusCode.BadRequest, error.StatusCode);
        Assert.Contains("HTTP 400", error.Message);
        Assert.Contains("returnUrl must be HTTPS", error.Message);
        Assert.Equal("FAILED", (await context.KPayPayments.SingleAsync()).Status);
        await Assert.ThrowsAsync<IdempotencyConflictException>(() =>
            CreateService(context, handler).CreateCheckoutAsync(organizerId, PlanId, IdempotencyKey));
        Assert.Single(handler.Requests);
    }

    [Fact]
    public async Task HandleWebhookAsync_RejectsAmountNotMatchingStoredPayment()
    {
        var organizerId = Guid.NewGuid();
        await using var context = CreateContext(organizerId);
        SeedPlanAndOrganizer(context, organizerId);
        context.KPayPayments.Add(new KPayPayment
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            PlanId = PlanId,
            ExternalId = "external-1",
            TransactionId = "kpay_1",
            Amount = 9900,
            Status = "PENDING",
        });
        await context.SaveChangesAsync();
        var handler = new StubHandler(_ => throw new InvalidOperationException(
            "KPay must not be queried for a callback with an incorrect amount."));

        var accepted = await CreateService(context, handler)
            .HandleWebhookAsync("kpay_1", "external-1", "SUCCESSFUL", 100);

        Assert.False(accepted);
        Assert.Equal("PENDING", (await context.KPayPayments.SingleAsync()).Status);
        Assert.Empty(await context.OrganizerSubscriptions.ToListAsync());
        Assert.Empty(handler.Requests);
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

    private static KPayPaymentService CreateService(AdminDbContext context, StubHandler handler)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["KPay:ApiKey"] = "kpay_test_key",
                ["KPay:SecretKey"] = "test_secret",
                ["Frontend:BaseUrl"] = "https://moment.example",
            })
            .Build();
        return new KPayPaymentService(context, configuration, new StubHttpClientFactory(handler));
    }

    private static HttpResponseMessage JsonResponse(string json) => new(HttpStatusCode.OK)
    {
        Content = new StringContent(json),
    };

    private sealed class StubHttpClientFactory(StubHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, disposeHandler: false);
    }

    private sealed class StubHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> respond)
        : HttpMessageHandler
    {
        public List<(string Body, string Uri)> Requests { get; } = [];

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            var body = request.Content == null
                ? string.Empty
                : await request.Content.ReadAsStringAsync(cancellationToken);
            Requests.Add((body, request.RequestUri!.ToString()));
            return await respond(request);
        }
    }
}
