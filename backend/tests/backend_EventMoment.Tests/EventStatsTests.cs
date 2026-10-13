using backend_EventMoment.Data;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

// Page Statistiques : visites/partages du site public et répartition des réponses.
public class EventStatsTests
{
    private static (AdminDbContext context, Guid organizerId, Event evt) Seed(EventStatus status = EventStatus.Publie)
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var evt = new Event
        {
            Id = Guid.NewGuid(), OrganizerId = organizerId, CategoryId = Guid.NewGuid(), Name = "Mariage", Slug = "mariage",
            Status = status, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Events.Add(evt);
        context.SaveChanges();
        return (context, organizerId, evt);
    }

    private static Guest AddGuest(AdminDbContext context, Event evt, GuestStatus status, bool? confirmed, short accompanying)
    {
        var guest = new Guest
        {
            Id = Guid.NewGuid(), EventId = evt.Id, FullName = "Invité", Phone = "+237699000000", Status = status,
            CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Guests.Add(guest);
        if (confirmed != null)
            context.RsvpResponses.Add(new RsvpResponse
            {
                Id = Guid.NewGuid(), GuestId = guest.Id, EventId = evt.Id, Confirmed = confirmed,
                AccompanyingCount = accompanying, CreatedAt = DateTimeOffset.UtcNow,
            });
        context.SaveChanges();
        return guest;
    }

    [Fact]
    public async Task VisitsAndShares_AreCountedPerDay_AndShowInTheSummary()
    {
        var (context, organizerId, evt) = Seed();
        var service = new EventStatsService(context);

        Assert.True(await service.RecordAsync("mariage", EventStatKind.Visit));
        Assert.True(await service.RecordAsync("mariage", EventStatKind.Visit));
        Assert.True(await service.RecordAsync("mariage", EventStatKind.Share));

        var summary = await service.GetSummaryAsync(evt.Id, organizerId);
        Assert.Equal(2, summary.TotalVisits);
        Assert.Equal(1, summary.TotalShares);
        var day = Assert.Single(summary.Daily);
        Assert.Equal(DateOnly.FromDateTime(DateTime.UtcNow), day.Date);
    }

    [Fact]
    public async Task Tracking_IgnoresUnpublishedSuspendedAndUnknownEvents()
    {
        var (draftContext, _, _) = Seed(EventStatus.Brouillon);
        Assert.False(await new EventStatsService(draftContext).RecordAsync("mariage", EventStatKind.Visit));

        var (context, _, evt) = Seed();
        context.EventModerations.Add(new EventModeration { EventId = evt.Id, SuspendedAt = DateTimeOffset.UtcNow });
        context.SaveChanges();
        var service = new EventStatsService(context);
        Assert.False(await service.RecordAsync("mariage", EventStatKind.Visit));
        Assert.False(await service.RecordAsync("inconnu", EventStatKind.Share));
        Assert.Empty(context.EventStatsDailies);
    }

    [Fact]
    public async Task Accompanying_CountsOnlyGuestsWhoAreComing()
    {
        var (context, organizerId, evt) = Seed();
        AddGuest(context, evt, GuestStatus.Present, confirmed: true, accompanying: 2);
        AddGuest(context, evt, GuestStatus.Absent, confirmed: false, accompanying: 3);
        // Confirmé en ligne puis passé « Absent » par l'organisateur.
        AddGuest(context, evt, GuestStatus.Absent, confirmed: true, accompanying: 4);
        AddGuest(context, evt, GuestStatus.EnAttente, confirmed: null, accompanying: 0);

        var summary = await new EventStatsService(context).GetSummaryAsync(evt.Id, organizerId);
        Assert.Equal(4, summary.TotalGuests);
        Assert.Equal(1, summary.ConfirmedGuests);
        Assert.Equal(2, summary.RefusedGuests);
        Assert.Equal(1, summary.PendingGuests);
        Assert.Equal(2, summary.TotalAccompanying);
    }
}
