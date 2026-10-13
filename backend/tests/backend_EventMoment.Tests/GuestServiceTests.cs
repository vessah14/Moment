using backend_EventMoment;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Tests;

public class GuestServiceTests
{
    private static (Utilisateur organizer, Event_categorie category, Event evt) SeedEvent(
        Data.AdminDbContext context, EventStatus status = EventStatus.Publie)
    {
        var organizer = new Utilisateur
        {
            Id = Guid.NewGuid(),
            Email = "organizer@example.com",
            PasswordHash = "hash",
            FullName = "Organizer",
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };

        var category = new Event_categorie
        {
            Id = Guid.NewGuid(),
            Code = "mariage",
            Label = "Mariage",
            Is_active = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdateAt = DateTimeOffset.UtcNow,
        };

        var evt = new Event
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizer.Id,
            CategoryId = category.Id,
            Name = "Mariage de Test",
            Slug = "mariage-de-test-" + Guid.NewGuid(),
            Status = status,
            EventDate = new DateOnly(2027, 3, 14),
            StartTime = new TimeOnly(16, 0),
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };

        context.Organizers.Add(organizer);
        context.EventCategories.Add(category);
        context.Events.Add(evt);
        context.SaveChanges();

        return (organizer, category, evt);
    }

    private static Guest SeedGuest(Data.AdminDbContext context, Guid eventId)
    {
        var guest = new Guest
        {
            Id = Guid.NewGuid(),
            EventId = eventId,
            FullName = "Invité Test",
            Status = GuestStatus.EnAttente,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Guests.Add(guest);
        context.SaveChanges();
        return guest;
    }

    [Fact]
    public async Task GetPublicInvitationAsync_ReturnsInvitation_ForPublishedEvent()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, _, evt) = SeedEvent(context);
        var guest = SeedGuest(context, evt.Id);
        var service = new GuestService(context);

        var result = await service.GetPublicInvitationAsync(guest.Id);

        Assert.NotNull(result);
        Assert.Equal(guest.FullName, result!.GuestFullName);
        Assert.Equal(evt.Name, result.EventName);
        Assert.Null(result.RsvpConfirmed);
    }

    [Fact]
    public async Task GetPublicInvitationAsync_ReturnsNull_ForUnpublishedEvent()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, _, evt) = SeedEvent(context, EventStatus.Brouillon);
        var guest = SeedGuest(context, evt.Id);
        var service = new GuestService(context);

        var result = await service.GetPublicInvitationAsync(guest.Id);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetPublicInvitationAsync_ReturnsNull_ForUnknownGuest()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        SeedEvent(context);
        var service = new GuestService(context);

        var result = await service.GetPublicInvitationAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task SubmitPublicRsvpAsync_ConfirmsAttendance_AndUpdatesGuestStatus()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, _, evt) = SeedEvent(context);
        var guest = SeedGuest(context, evt.Id);
        var service = new GuestService(context);

        var result = await service.SubmitPublicRsvpAsync(guest.Id, new SubmitPublicRsvpDto
        {
            Confirmed = true,
            AccompanyingCount = 2,
            Message = "Avec plaisir !",
        });

        Assert.NotNull(result);
        Assert.True(result!.RsvpConfirmed);
        Assert.Equal(2, result.RsvpAccompanyingCount);

        var updatedGuest = await context.Guests.IgnoreQueryFilters()
            .FirstAsync(g => g.Id == guest.Id);
        Assert.Equal(GuestStatus.Present, updatedGuest.Status);
    }

    [Fact]
    public async Task SubmitPublicRsvpAsync_CanChangeAnswer_ReusingSameRsvpRow()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, _, evt) = SeedEvent(context);
        var guest = SeedGuest(context, evt.Id);
        var service = new GuestService(context);

        await service.SubmitPublicRsvpAsync(guest.Id, new SubmitPublicRsvpDto { Confirmed = true, AccompanyingCount = 1 });
        var second = await service.SubmitPublicRsvpAsync(guest.Id, new SubmitPublicRsvpDto { Confirmed = false, AccompanyingCount = 0 });

        Assert.NotNull(second);
        Assert.False(second!.RsvpConfirmed);

        var rsvpRows = context.RsvpResponses.IgnoreQueryFilters().Count(r => r.GuestId == guest.Id);
        Assert.Equal(1, rsvpRows);
    }

    [Fact]
    public async Task SubmitPublicRsvpAsync_ReturnsNull_ForUnpublishedEvent()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, _, evt) = SeedEvent(context, EventStatus.Brouillon);
        var guest = SeedGuest(context, evt.Id);
        var service = new GuestService(context);

        var result = await service.SubmitPublicRsvpAsync(guest.Id, new SubmitPublicRsvpDto { Confirmed = true });

        Assert.Null(result);
    }
}
