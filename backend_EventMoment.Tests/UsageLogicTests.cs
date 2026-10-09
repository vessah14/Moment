using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace backend_EventMoment.Tests;

// Correctifs de la 2e analyse (2026-09-29) : logique d'utilisation et abonnements.
public class UsageLogicTests
{
    private static (Utilisateur organizer, Event evt) SeedEvent(AdminDbContext context, Guid? organizerId = null,
        DateOnly? eventDate = null, string slug = "mariage-test")
    {
        var organizer = new Utilisateur
        {
            Id = organizerId ?? Guid.NewGuid(), Email = $"org-{Guid.NewGuid():N}@example.com", PasswordHash = "hash",
            FullName = "Organizer", IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        var category = new Event_categorie
        {
            Id = Guid.NewGuid(), Code = "mariage", Label = "Mariage", Is_active = true,
            CreatedAt = DateTimeOffset.UtcNow, UpdateAt = DateTimeOffset.UtcNow,
        };
        var evt = new Event
        {
            Id = Guid.NewGuid(), OrganizerId = organizer.Id, CategoryId = category.Id, Name = "Mariage", Slug = slug,
            Status = EventStatus.Publie, EventDate = eventDate ?? new DateOnly(2030, 6, 1),
            CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Organizers.Add(organizer);
        context.EventCategories.Add(category);
        context.Events.Add(evt);
        context.SaveChanges();
        return (organizer, evt);
    }

    private static Guest SeedGuest(AdminDbContext context, Guid eventId, GuestStatus status = GuestStatus.EnAttente, string email = "guest@example.com")
    {
        var guest = new Guest
        {
            Id = Guid.NewGuid(), EventId = eventId, FullName = "Invité", Email = email, Status = status,
            CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Guests.Add(guest);
        context.SaveChanges();
        return guest;
    }

    // ---------------------------------------------------------------- Slugs

    [Theory]
    [InlineData("Mariage Awa & Ibrahim", "mariage-awa-ibrahim")]
    [InlineData("  Été 2027 : Fête / Soirée #1 ?  ", "ete-2027-fete-soiree-1")]
    [InlineData("!!!", "evenement")]
    public void Slugify_ProducesUrlSafeSlug(string name, string expected)
    {
        Assert.Equal(expected, SlugGenerator.Slugify(name));
    }

    [Fact]
    public async Task CreateEvent_WithSameNameAsAnotherOrganizer_GetsUniqueSlug()
    {
        // Deux organisateurs sur la même base : A a déjà un événement "mariage".
        var sharedDb = Guid.NewGuid().ToString();
        var ctxA = TestDbContextFactory.CreateAdminContext(databaseName: sharedDb);
        var (_, first) = SeedEvent(ctxA, slug: "mariage");
        var otherId = Guid.NewGuid();
        var ctxB = TestDbContextFactory.CreateAdminContext(otherId, databaseName: sharedDb);
        var created = await new EventService(ctxB).CreateAsync(
            new CreateEventDto { Name = "Mariage", CategoryId = first.CategoryId }, otherId);

        Assert.Equal("mariage-2", created.Slug);
    }

    // ---------------------------------------------------------------- Check-in

    [Fact]
    public async Task ConfirmedRsvp_IsNotCheckedIn_UntilScanned()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var (_, evt) = SeedEvent(context, organizerId);
        var guest = SeedGuest(context, evt.Id, GuestStatus.Present);
        var service = new GuestService(context);

        var before = await service.GetByIdAsync(guest.Id, organizerId);
        Assert.Equal(GuestStatus.Present, before.Status);
        Assert.Null(before.CheckedInAt);

        var checkedIn = await service.CheckInAsync(guest.Id, organizerId);
        Assert.NotNull(checkedIn.CheckedInAt);

        // Deuxième scan : pas de doublon, même heure d'arrivée.
        var again = await service.CheckInAsync(guest.Id, organizerId);
        Assert.Equal(checkedIn.CheckedInAt, again.CheckedInAt);

        var undone = await service.UndoCheckInAsync(guest.Id, organizerId);
        Assert.Null(undone.CheckedInAt);
        Assert.Equal(GuestStatus.Present, undone.Status);
    }

    [Fact]
    public async Task CheckIn_RejectsOtherOrganizersGuest()
    {
        var ownerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(ownerId);
        var (_, evt) = SeedEvent(context, ownerId);
        var guest = SeedGuest(context, evt.Id);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => new GuestService(context).CheckInAsync(guest.Id, Guid.NewGuid()));
    }

    // ---------------------------------------------------------------- Doublons / RSVP

    [Fact]
    public async Task CreateGuest_RejectsDuplicateEmailInSameEvent()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var (_, evt) = SeedEvent(context, organizerId);
        SeedGuest(context, evt.Id, email: "awa@example.com");

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => new GuestService(context).CreateAsync(
            new CreateGuestDto { FullName = "Awa bis", Phone = "+221770000000", Email = "AWA@example.com" }, evt.Id, organizerId));
        Assert.Contains("existe déjà", ex.Message);
    }

    [Fact]
    public async Task PublicRsvp_IsClosed_AfterEventDate()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, evt) = SeedEvent(context, eventDate: DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2)));
        var guest = SeedGuest(context, evt.Id);
        var service = new GuestService(context);

        var invitation = await service.GetPublicInvitationAsync(guest.Id);
        Assert.True(invitation!.RsvpClosed);
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.SubmitPublicRsvpAsync(guest.Id, new SubmitPublicRsvpDto { Confirmed = true }));
    }

    // ---------------------------------------------------------------- Livre d'or public

    [Fact]
    public async Task PublicGuestBook_CreatesPendingEntry_OnlyWhenBlockIsShown()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (organizer, evt) = SeedEvent(context, slug: "mariage-livre");
        var email = new FakeEmailSender();
        var config = new ConfigurationBuilder().Build();
        var service = new GuestBookService(context, new OrganizerNotifier(context, email, config, NullLogger<OrganizerNotifier>.Instance));
        var dto = new CreateGuestBookEntryDto { AuthorName = "Fatou", Message = "Tous nos vœux !" };

        // Pas de bloc "Livre d'or" sur le site : refusé.
        Assert.False(await service.CreatePublicAsync("mariage-livre", dto));

        context.EventBlocks.Add(new EventBlock { Id = Guid.NewGuid(), EventId = evt.Id, BlockType = "Livre d'or", IsVisible = true, Content = "{}" });
        context.SaveChanges();

        Assert.True(await service.CreatePublicAsync("mariage-livre", dto));
        // Contexte anonyme (comme l'endpoint public) : on lit hors filtre organisateur.
        var entry = Assert.Single(context.GuestBookEntries.IgnoreQueryFilters().ToList());
        Assert.Equal(GuestBookStatus.EnAttente, entry.Status);
        Assert.Equal(organizer.Email, Assert.Single(email.Sent).To);
    }

    // ---------------------------------------------------------------- Abonnements

    private static SubscriptionPlan SeedPlan(AdminDbContext context, int priceCents, bool active = true)
    {
        var plan = new SubscriptionPlan
        {
            Id = Guid.NewGuid(), Code = $"plan-{Guid.NewGuid():N}", Label = priceCents == 0 ? "Free" : "Pro",
            PriceCents = priceCents, Billing = priceCents == 0 ? PlanBilling.Gratuit : PlanBilling.Mensuel,
            IsActive = active, CreatedAt = DateTimeOffset.UtcNow,
        };
        context.SubscriptionPlans.Add(plan);
        context.SaveChanges();
        return plan;
    }

    [Fact]
    public async Task Subscribe_ToPaidPlan_IsRefusedWithoutPayment()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var paid = SeedPlan(context, 990000);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            new UserSubscriptionService(context).SubscribeAsync(organizerId, paid.Id, new SubscribeToPlanDto()));
        Assert.Empty(context.OrganizerSubscriptions.ToList());
    }

    [Fact]
    public async Task Subscribe_ToFreePlan_ClosesPreviousActiveSubscription()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var free = SeedPlan(context, 0);
        var service = new UserSubscriptionService(context);

        await service.SubscribeAsync(organizerId, free.Id, new SubscribeToPlanDto());
        await service.SubscribeAsync(organizerId, free.Id, new SubscribeToPlanDto());

        Assert.Single(context.OrganizerSubscriptions.ToList(), s => s.Status == SubscriptionStatus.Actif);
    }
}
