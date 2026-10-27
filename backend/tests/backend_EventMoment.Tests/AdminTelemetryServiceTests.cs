using backend_EventMoment.Models;
using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

public sealed class AdminTelemetryServiceTests
{
    [Fact]
    public async Task DashboardCountsFunnelWeeklyActivityAndUpcomingEvents()
    {
        await using var context = TestDbContextFactory.CreateAdminContext();
        var now = DateTimeOffset.UtcNow;
        var activeOrganizer = new Utilisateur
        {
            Id = Guid.NewGuid(),
            Email = "active@example.com",
            PasswordHash = "hash",
            FullName = "Organisation active",
            IsActive = true,
            CreatedAt = now.AddDays(-2),
            UpdatedAt = now.AddDays(-2)
        };
        var inactiveOrganizer = new Utilisateur
        {
            Id = Guid.NewGuid(),
            Email = "inactive@example.com",
            PasswordHash = "hash",
            FullName = "Organisation inactive",
            IsActive = false,
            CreatedAt = now.AddDays(-20),
            UpdatedAt = now.AddDays(-20)
        };
        var today = DateOnly.FromDateTime(now.UtcDateTime);
        var publishedEvent = NewEvent(activeOrganizer.Id, EventStatus.Publie, now, today.AddDays(3));
        var draftEvent = NewEvent(inactiveOrganizer.Id, EventStatus.Brouillon, now.AddDays(-10), null);
        publishedEvent.Utilisateur = activeOrganizer;
        draftEvent.Utilisateur = inactiveOrganizer;
        var guest = new Guest
        {
            Id = Guid.NewGuid(),
            EventId = publishedEvent.Id,
            FullName = "Invité",
            Status = GuestStatus.EnAttente,
            CreatedAt = now.AddDays(-1),
            UpdatedAt = now.AddDays(-1)
        };

        context.Organizers.AddRange(activeOrganizer, inactiveOrganizer);
        context.Events.AddRange(publishedEvent, draftEvent);
        context.Guests.Add(guest);
        context.RsvpResponses.Add(new RsvpResponse
        {
            Id = Guid.NewGuid(),
            EventId = publishedEvent.Id,
            GuestId = guest.Id,
            Confirmed = true,
            CreatedAt = now.AddHours(-2),
            RespondedAt = now.AddHours(-2)
        });
        context.TechnicalErrorLogs.Add(new TechnicalErrorLog
        {
            Id = Guid.NewGuid(),
            Category = "Erreur interne",
            Route = "/api/admin/platform/events",
            StatusCode = 500,
            CreatedAt = now.AddHours(-1)
        });
        await context.SaveChangesAsync();

        var result = await new AdminTelemetryService(context).GetDashboardAsync(CancellationToken.None);

        Assert.Equal(1, result.ActiveOrganizations);
        Assert.Equal(2, result.TotalEvents);
        Assert.Equal(1, result.PublishedEvents);
        Assert.Equal(1, result.DraftEvents);
        Assert.Equal(1, result.TotalGuests);
        Assert.Equal(1, result.ErrorsLast24Hours);
        Assert.Equal(new[] { 2, 2, 1, 1, 1 }, result.Funnel.Select(step => step.Organizations));
        Assert.Equal(1, result.Trends.Organizations);
        Assert.Equal(1, result.Trends.Events);
        Assert.Equal(1, result.Trends.PublishedEvents);
        Assert.Equal(1, result.Trends.Guests);
        Assert.Equal(1, result.Trends.Rsvps);
        var upcoming = Assert.Single(result.UpcomingEvents);
        Assert.Equal(publishedEvent.Id, upcoming.Id);
        Assert.Equal("Organisation active", upcoming.Organization);
        Assert.Equal(1, upcoming.Guests);
    }

    private static Event NewEvent(Guid organizerId, EventStatus status, DateTimeOffset createdAt, DateOnly? eventDate) =>
        new()
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            CategoryId = Guid.NewGuid(),
            Name = status == EventStatus.Publie ? "Événement à venir" : "Brouillon",
            Slug = Guid.NewGuid().ToString("N"),
            Status = status,
            EventDate = eventDate,
            PublishedAt = status == EventStatus.Publie ? createdAt : null,
            CreatedAt = createdAt,
            UpdatedAt = createdAt,
            CustomFields = "{}"
        };
}
