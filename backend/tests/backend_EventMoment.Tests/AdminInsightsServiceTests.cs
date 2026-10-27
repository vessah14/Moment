using backend_EventMoment.Dtos;
using backend_EventMoment.Models;
using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

public class AdminInsightsServiceTests
{
    private static Utilisateur SeedOrganizer(backend_EventMoment.Data.AdminDbContext context, DateTimeOffset createdAt)
    {
        var organizer = new Utilisateur
        {
            Id = Guid.NewGuid(), Email = $"{Guid.NewGuid():N}@example.com", PasswordHash = "x", FullName = "Awa",
            IsActive = true, CreatedAt = createdAt, UpdatedAt = createdAt,
        };
        context.Organizers.Add(organizer);
        context.SaveChanges();
        return organizer;
    }

    [Fact]
    public async Task TimeSeries_CountsEachDayInCameroonTime_IncludingEmptyDays()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var today = DateOnly.FromDateTime(DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(1)).DateTime);
        // 23h30 UTC la veille = 00h30 à Douala aujourd'hui.
        var justAfterMidnight = new DateTimeOffset(today.ToDateTime(new TimeOnly(0, 30)), TimeSpan.FromHours(1));
        SeedOrganizer(context, justAfterMidnight);
        SeedOrganizer(context, justAfterMidnight.AddDays(-2));

        var series = await new AdminInsightsService(context).GetTimeSeriesAsync(7, CancellationToken.None);

        Assert.Equal(7, series.Count);
        Assert.Equal(today, series[^1].Date);
        Assert.Equal(1, series[^1].Signups);
        Assert.Equal(1, series[^3].Signups);
        Assert.Equal(2, series.Sum(p => p.Signups));
    }

    [Fact]
    public async Task GrantAndRevokePlan_ChangeTheOrganizerLimits()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var organizer = SeedOrganizer(context, DateTimeOffset.UtcNow);
        var premium = new SubscriptionPlan
        {
            Id = Guid.NewGuid(), Code = "premium", Label = "Premium", PriceCents = 500000, Billing = PlanBilling.Mensuel,
            Features = """{"maxEvents": 5, "maxGuests": 500}""", IsActive = true, CreatedAt = DateTimeOffset.UtcNow,
        };
        context.SubscriptionPlans.Add(premium);
        context.SaveChanges();
        var insights = new AdminInsightsService(context);

        await insights.GrantPlanAsync(organizer.Id, new AdminGrantPlanDto { PlanId = premium.Id, Days = 30 }, CancellationToken.None);

        var detail = await insights.GetOrganizationAsync(organizer.Id, CancellationToken.None);
        Assert.Equal("Premium", detail!.PlanLabel);
        Assert.True(detail.PlanEndsAt > DateTimeOffset.UtcNow.AddDays(29));
        Assert.Equal("premium", (await new PlanService(context).GetUsageAsync(organizer.Id)).PlanCode);

        await insights.RevokePlanAsync(organizer.Id, CancellationToken.None);
        Assert.Equal("Free", (await insights.GetOrganizationAsync(organizer.Id, CancellationToken.None))!.PlanLabel);
        Assert.Equal("free", (await new PlanService(context).GetUsageAsync(organizer.Id)).PlanCode);
    }

    [Fact]
    public async Task GrantPlan_RefusesUnknownOrFreePlans()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var organizer = SeedOrganizer(context, DateTimeOffset.UtcNow);

        await Assert.ThrowsAsync<InvalidOperationException>(() => new AdminInsightsService(context)
            .GrantPlanAsync(organizer.Id, new AdminGrantPlanDto { PlanId = Guid.NewGuid(), Days = 30 }, CancellationToken.None));
    }
}
