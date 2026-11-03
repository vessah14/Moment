using backend_EventMoment.Models;
using backend_EventMoment.Services;
using Microsoft.Extensions.Logging.Abstractions;

namespace backend_EventMoment.Tests;

public class InAppNotificationServiceTests
{
    [Fact]
    public async Task GuestbookNotificationAppearsInFeedAndCanBeMarkedRead()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var evt = new Event
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            CategoryId = Guid.NewGuid(),
            Name = "Mariage",
            Slug = "mariage",
            Status = EventStatus.Publie,
            CustomFields = "{}",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Events.Add(evt);
        await context.SaveChangesAsync();

        var service = new InAppNotificationService(context, NullLogger<InAppNotificationService>.Instance);
        await service.NotifyGuestbookAsync(evt.Id, "Amina");

        var feed = await service.GetAsync(organizerId);
        var notification = Assert.Single(feed.Items);
        Assert.Equal(1, feed.UnreadCount);
        Assert.Equal("guestbook", notification.Type);
        Assert.Contains("Amina", notification.Message);

        Assert.True(await service.MarkReadAsync(notification.Id, organizerId));
        feed = await service.GetAsync(organizerId);
        Assert.Equal(0, feed.UnreadCount);
        Assert.NotNull(Assert.Single(feed.Items).ReadAt);
    }

    [Fact]
    public async Task NotificationsAreScopedToOrganizerAndCanBeMarkedReadTogether()
    {
        var databaseName = Guid.NewGuid().ToString();
        var firstOrganizerId = Guid.NewGuid();
        var secondOrganizerId = Guid.NewGuid();
        var eventId = Guid.NewGuid();
        var seed = TestDbContextFactory.CreateAdminContext(firstOrganizerId, databaseName);
        seed.Events.Add(new Event
        {
            Id = eventId,
            OrganizerId = firstOrganizerId,
            CategoryId = Guid.NewGuid(),
            Name = "Conférence",
            Slug = "conference",
            Status = EventStatus.Publie,
            CustomFields = "{}",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        });
        seed.OrganizerNotifications.AddRange(
            CreateNotification(firstOrganizerId, eventId, "guestbook"),
            CreateNotification(secondOrganizerId, eventId, "rsvp"));
        await seed.SaveChangesAsync();

        var service = new InAppNotificationService(seed, NullLogger<InAppNotificationService>.Instance);
        var feed = await service.GetAsync(firstOrganizerId);

        Assert.Single(feed.Items);
        Assert.Equal(1, await service.MarkAllReadAsync(firstOrganizerId));
        Assert.Equal(0, (await service.GetAsync(firstOrganizerId)).UnreadCount);
    }

    [Fact]
    public async Task NotificationCanBeDeletedOnlyByItsOrganizer()
    {
        var organizerId = Guid.NewGuid();
        var otherOrganizerId = Guid.NewGuid();
        var eventId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        context.Events.Add(new Event
        {
            Id = eventId,
            OrganizerId = organizerId,
            CategoryId = Guid.NewGuid(),
            Name = "Réception",
            Slug = "reception",
            Status = EventStatus.Publie,
            CustomFields = "{}",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        });
        var ownNotification = CreateNotification(organizerId, eventId, "guestbook");
        var otherNotification = CreateNotification(otherOrganizerId, eventId, "rsvp");
        context.OrganizerNotifications.AddRange(ownNotification, otherNotification);
        await context.SaveChangesAsync();

        var service = new InAppNotificationService(context, NullLogger<InAppNotificationService>.Instance);

        Assert.False(await service.DeleteAsync(otherNotification.Id, organizerId));
        Assert.True(await service.DeleteAsync(ownNotification.Id, organizerId));
        Assert.Empty((await service.GetAsync(organizerId)).Items);
    }

    private static OrganizerNotification CreateNotification(Guid organizerId, Guid eventId, string type) => new()
    {
        Id = Guid.NewGuid(),
        OrganizerId = organizerId,
        EventId = eventId,
        Type = type,
        Title = "Nouvelle activité",
        Message = "Un invité a effectué une action.",
        Link = "/dashboard",
        CreatedAt = DateTimeOffset.UtcNow,
    };
}
