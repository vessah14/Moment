using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Tests;

// Offres (limites, demandes de passage à une offre payante, activation par l'admin) et
// avis des clients sur la plateforme.
public class PlanAndReviewTests
{
    private static SubscriptionPlan AddPlan(AdminDbContext context, string code, int priceCents, string features, PlanBilling billing = PlanBilling.Mensuel)
    {
        var plan = new SubscriptionPlan
        {
            Id = Guid.NewGuid(), Code = code, Label = code == "free" ? "Free" : char.ToUpper(code[0]) + code[1..],
            PriceCents = priceCents, Billing = billing, Features = features, IsActive = true, CreatedAt = DateTimeOffset.UtcNow,
        };
        context.SubscriptionPlans.Add(plan);
        context.SaveChanges();
        return plan;
    }

    private static Utilisateur AddOrganizer(AdminDbContext context)
    {
        var organizer = new Utilisateur
        {
            Id = Guid.NewGuid(), Email = $"org-{Guid.NewGuid():N}@example.com", PasswordHash = "hash", FullName = "Awa Diop",
            IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Organizers.Add(organizer);
        context.SaveChanges();
        return organizer;
    }

    private static Event AddEvent(AdminDbContext context, Guid organizerId, EventStatus status = EventStatus.Brouillon)
    {
        var evt = new Event
        {
            Id = Guid.NewGuid(), OrganizerId = organizerId, CategoryId = Guid.NewGuid(), Name = "Événement",
            Slug = $"evt-{Guid.NewGuid():N}", Status = status, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Events.Add(evt);
        context.SaveChanges();
        return evt;
    }

    [Fact]
    public async Task FreePlan_LimitsEvents_ButIgnoresArchivedOnes()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        AddPlan(context, "free", 0, """{"maxEvents": 1, "maxGuests": 50}""", PlanBilling.Gratuit);
        var organizer = AddOrganizer(context);
        var service = new PlanService(context);

        await service.EnsureCanCreateEventAsync(organizer.Id);
        AddEvent(context, organizer.Id);
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.EnsureCanCreateEventAsync(organizer.Id));
        Assert.Contains("Free", ex.Message);

        var usage = await service.GetUsageAsync(organizer.Id);
        Assert.Equal(("free", 1, 1, 50), (usage.PlanCode, usage.MaxEvents, usage.EventsUsed, usage.MaxGuests));

        // Un événement archivé libère la place.
        context.Events.IgnoreQueryFilters().Single().Status = EventStatus.Archive;
        context.SaveChanges();
        await service.EnsureCanCreateEventAsync(organizer.Id);
    }

    [Fact]
    public async Task GuestLimit_AppliesPerEvent()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        AddPlan(context, "free", 0, """{"maxEvents": 1, "maxGuests": 2}""", PlanBilling.Gratuit);
        var organizer = AddOrganizer(context);
        var evt = AddEvent(context, organizer.Id);
        var service = new PlanService(context);
        foreach (var i in new[] { 1, 2 })
            context.Guests.Add(new Guest { Id = Guid.NewGuid(), EventId = evt.Id, FullName = $"Invité {i}", Email = $"g{i}@example.com", CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow });
        context.SaveChanges();

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.EnsureCanAddGuestAsync(organizer.Id, evt.Id));
    }

    [Fact]
    public async Task UpgradeRequest_IsApprovedByAdmin_AndLiftsLimits()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        AddPlan(context, "free", 0, """{"maxEvents": 1}""", PlanBilling.Gratuit);
        var premium = AddPlan(context, "premium", 990000, """{"maxEvents": 5, "maxGuests": 500}""");
        var organizer = AddOrganizer(context);
        AddEvent(context, organizer.Id);
        var service = new PlanService(context);

        var request = await service.RequestUpgradeAsync(organizer.Id, new CreateUpgradeRequestDto { PlanId = premium.Id, Phone = "6 99 00 00 00" });
        Assert.Equal(UpgradeRequestStatus.EnAttente, request.Status);
        // Une seule demande en attente à la fois.
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.RequestUpgradeAsync(organizer.Id, new CreateUpgradeRequestDto { PlanId = premium.Id, Phone = "6 99 00 00 00" }));
        Assert.NotNull((await service.GetUsageAsync(organizer.Id)).PendingRequest);

        var approved = await service.ApproveAsync(request.Id, Guid.NewGuid(), "Paiement reçu");
        Assert.Equal(UpgradeRequestStatus.Approuvee, approved.Status);
        var usage = await service.GetUsageAsync(organizer.Id);
        Assert.Equal(("premium", 5), (usage.PlanCode, usage.MaxEvents));
        Assert.True(usage.EndsAt > DateTimeOffset.UtcNow.AddDays(27));
        await service.EnsureCanCreateEventAsync(organizer.Id);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ApproveAsync(request.Id, Guid.NewGuid(), null));
    }

    [Fact]
    public async Task UpgradeRequest_RefusesFreeOrCurrentPlan_AndCanBeCancelled()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var free = AddPlan(context, "free", 0, "{}", PlanBilling.Gratuit);
        var premium = AddPlan(context, "premium", 990000, "{}");
        var organizer = AddOrganizer(context);
        var service = new PlanService(context);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.RequestUpgradeAsync(organizer.Id, new CreateUpgradeRequestDto { PlanId = free.Id, Phone = "699000000" }));
        await service.RequestUpgradeAsync(organizer.Id, new CreateUpgradeRequestDto { PlanId = premium.Id, Phone = "699000000" });
        Assert.True(await service.CancelPendingRequestAsync(organizer.Id));
        Assert.Equal(UpgradeRequestStatus.Annulee, (await service.GetLatestRequestAsync(organizer.Id))!.Status);
        Assert.False(await service.CancelPendingRequestAsync(organizer.Id));
    }

    [Fact]
    public async Task Review_IsPublishedOnlyAfterModeration_AndEditingResetsIt()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var organizer = AddOrganizer(context);
        var service = new ReviewService(context);
        var dto = new SaveReviewDto { Rating = 5, Comment = "  Site prêt en une soirée, bravo !  ", DisplayName = "Awa D.", Context = "Mariage · Dakar" };

        var review = await service.SaveMineAsync(organizer.Id, dto);
        Assert.Equal("Site prêt en une soirée, bravo !", review.Comment);
        Assert.Empty(await service.GetPublishedAsync(6));

        await service.SetStatusAsync(review.Id, PlatformReviewStatus.Publie);
        var published = Assert.Single(await service.GetPublishedAsync(6));
        Assert.Equal(("Awa D.", (short)5), (published.DisplayName, published.Rating));

        // Modifier un avis publié le repasse en attente.
        await service.SaveMineAsync(organizer.Id, new SaveReviewDto { Rating = 4, Comment = "Toujours très bien, merci.", DisplayName = "Awa D." });
        Assert.Empty(await service.GetPublishedAsync(6));
        Assert.Single(context.PlatformReviews);
    }
}
