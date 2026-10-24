using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Models;
using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

// Fonctions réservées à certaines offres (subscription_plans.features) : photos, plan de table,
// billetterie, modèles premium, rappels automatiques, mention TBF MOMENT.
public class PlanFeatureTests
{
    private const string FreeFeatures = """
        {"maxEvents": 3, "maxGuests": 50, "maxPhotos": 2, "premiumTemplates": false, "seating": false,
         "checkin": false, "ticketing": false, "branding": false, "autoReminders": false}
        """;
    private const string PremiumFeatures = """
        {"maxEvents": 5, "maxGuests": 500, "maxPhotos": 200, "premiumTemplates": true, "seating": true,
         "checkin": true, "ticketing": false, "branding": false, "autoReminders": false}
        """;
    private const string BusinessFeatures = """
        {"maxEvents": null, "maxGuests": 2000, "maxPhotos": 1000, "premiumTemplates": true, "seating": true,
         "checkin": true, "ticketing": true, "branding": true, "autoReminders": false}
        """;

    private static SubscriptionPlan AddPlan(AdminDbContext context, string code, string label, int priceCents, string features)
    {
        var plan = new SubscriptionPlan
        {
            Id = Guid.NewGuid(), Code = code, Label = label, PriceCents = priceCents,
            Billing = priceCents == 0 ? PlanBilling.Gratuit : PlanBilling.Mensuel, Features = features, IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        context.SubscriptionPlans.Add(plan);
        context.SaveChanges();
        return plan;
    }

    private static (AdminDbContext Context, Guid OrganizerId, Event Event, SubscriptionPlan Premium) Setup()
    {
        // Contexte de l'organisateur connecté : les filtres par organisateur s'appliquent comme en vrai.
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        AddPlan(context, "free", "Free", 0, FreeFeatures);
        var premium = AddPlan(context, "premium", "Premium", 500000, PremiumFeatures);
        AddPlan(context, "business", "Business", 1500000, BusinessFeatures);
        var organizer = new Utilisateur
        {
            Id = organizerId, Email = $"org-{Guid.NewGuid():N}@example.com", PasswordHash = "hash", FullName = "Awa Diop",
            IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Organizers.Add(organizer);
        var evt = new Event
        {
            Id = Guid.NewGuid(), OrganizerId = organizer.Id, CategoryId = Guid.NewGuid(), Name = "Mariage",
            Slug = $"evt-{Guid.NewGuid():N}", CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Events.Add(evt);
        context.SaveChanges();
        return (context, organizer.Id, evt, premium);
    }

    private static void Subscribe(AdminDbContext context, Guid organizerId, SubscriptionPlan plan)
    {
        context.OrganizerSubscriptions.Add(new UserSubscription
        {
            Id = Guid.NewGuid(), OrganizerId = organizerId, PlanId = plan.Id, Status = SubscriptionStatus.Actif,
            StartedAt = DateTimeOffset.UtcNow, EndsAt = DateTimeOffset.UtcNow.AddMonths(1),
        });
        context.SaveChanges();
    }

    [Fact]
    public async Task Free_RefusesPaidFeatures_ButAllowsCheckin()
    {
        var (context, organizerId, _, _) = Setup();
        var plans = new PlanService(context);

        var seating = await Assert.ThrowsAsync<InvalidOperationException>(() => plans.EnsureFeatureAsync(organizerId, PlanFeature.Seating));
        Assert.Contains("à partir de l'offre Premium", seating.Message);
        var ticketing = await Assert.ThrowsAsync<InvalidOperationException>(() => plans.EnsureFeatureAsync(organizerId, PlanFeature.Ticketing));
        Assert.Contains("à partir de l'offre Business", ticketing.Message);
        await plans.EnsureFeatureAsync(organizerId, PlanFeature.Checkin);

        var usage = await plans.GetUsageAsync(organizerId);
        Assert.Equal(2, usage.MaxPhotos);
        Assert.True(usage.Features["checkin"]);
    }

    [Fact]
    public async Task Premium_UnlocksSeating_ButNotTicketing_AndCheckinIsAvailable()
    {
        var (context, organizerId, _, premium) = Setup();
        Subscribe(context, organizerId, premium);
        var plans = new PlanService(context);

        await plans.EnsureFeatureAsync(organizerId, PlanFeature.Seating);
        await plans.EnsureFeatureAsync(organizerId, PlanFeature.Checkin);
        await plans.EnsureFeatureAsync(organizerId, PlanFeature.PremiumTemplates);
        await Assert.ThrowsAsync<InvalidOperationException>(() => plans.EnsureFeatureAsync(organizerId, PlanFeature.Ticketing));

        var secondEvent = new Event
        {
            Id = Guid.NewGuid(), OrganizerId = organizerId, CategoryId = Guid.NewGuid(), Name = "Anniversaire",
            Slug = $"evt-{Guid.NewGuid():N}", CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Events.Add(secondEvent);
        await context.SaveChangesAsync();

        await plans.EnsureCanCreateEventAsync(organizerId);
        var thirdEvent = new Event
        {
            Id = Guid.NewGuid(), OrganizerId = organizerId, CategoryId = Guid.NewGuid(), Name = "Réception",
            Slug = $"evt-{Guid.NewGuid():N}", CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Events.Add(thirdEvent);
        await context.SaveChangesAsync();

        var usage = await plans.GetUsageAsync(organizerId);
        Assert.Equal(("premium", 3, 3), (usage.PlanCode, usage.MaxEvents, usage.EventsUsed));
        var limitError = await Assert.ThrowsAsync<InvalidOperationException>(() => plans.EnsureCanCreateEventAsync(organizerId));
        Assert.Contains("3 événements", limitError.Message);
    }

    [Fact]
    public async Task FreeOrganizer_CanCheckInGuest()
    {
        var (context, organizerId, evt, _) = Setup();
        var guest = new Guest
        {
            Id = Guid.NewGuid(),
            EventId = evt.Id,
            FullName = "Invité test",
            Status = GuestStatus.Present,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Guests.Add(guest);
        await context.SaveChangesAsync();

        var service = new GuestService(context, plans: new PlanService(context));

        var checkedIn = await service.CheckInAsync(guest.Id, organizerId);

        Assert.NotNull(checkedIn.CheckedInAt);
    }

    [Fact]
    public async Task PhotoLimit_AppliesPerEvent()
    {
        var (context, organizerId, evt, _) = Setup();
        var plans = new PlanService(context);
        foreach (var i in new[] { 1, 2 })
            context.GalleryPhotos.Add(new GalleryPhoto { Id = Guid.NewGuid(), EventId = evt.Id, Url = $"https://x/{i}.jpg", CreatedAt = DateTimeOffset.UtcNow });
        context.SaveChanges();

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => plans.EnsureCanAddPhotoAsync(organizerId, evt.Id));
        Assert.Contains("2 photos", ex.Message);
    }

    [Fact]
    public async Task SeatingService_RefusesTables_OnFree()
    {
        var (context, organizerId, evt, _) = Setup();
        var seating = new SeatingService(context, new PlanService(context));

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            seating.CreateTableAsync(new CreateEventTableDto { Label = "Table 1", Capacity = 8 }, evt.Id, organizerId));
    }

    [Fact]
    public async Task PremiumTemplate_NeedsPlan_ButAlreadyChosenOneStaysEditable()
    {
        var (context, organizerId, evt, _) = Setup();
        var events = new EventService(context, plans: new PlanService(context));
        var dto = new UpdateEventDto { Name = evt.Name, CategoryId = evt.CategoryId, Status = evt.Status, CustomFields = """{"template": "Toghu Royal"}""" };

        await Assert.ThrowsAsync<InvalidOperationException>(() => events.UpdateAsync(evt.Id, dto, organizerId));

        // Modèle déjà en place (offre arrivée à échéance) : l'événement reste modifiable.
        evt.CustomFields = """{"template": "Toghu Royal"}""";
        context.SaveChanges();
        await events.UpdateAsync(evt.Id, dto, organizerId);

        // Un modèle gratuit ne demande rien.
        await events.UpdateAsync(evt.Id, new UpdateEventDto { Name = evt.Name, CategoryId = evt.CategoryId, Status = evt.Status, CustomFields = """{"template": "Classique"}""" }, organizerId);
    }

    [Fact]
    public async Task LegacyPlanWithoutFlags_KeepsEverythingAllowed()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        AddPlan(context, "free", "Free", 0, """{"maxEvents": 1, "maxGuests": 50}""");
        var plans = new PlanService(context);

        Assert.True(await plans.HasFeatureAsync(Guid.NewGuid(), PlanFeature.Ticketing));
        Assert.Null((await plans.GetUsageAsync(Guid.NewGuid())).MaxPhotos);
    }
}
