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
    public async Task GetPublicInvitationAsync_ReturnsHeroTitle_ForPersonalizedDisplay()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, _, evt) = SeedEvent(context);
        var guest = SeedGuest(context, evt.Id);
        context.EventBlocks.Add(new EventBlock
        {
            Id = Guid.NewGuid(),
            EventId = evt.Id,
            BlockType = "Hero",
            Position = 0,
            IsVisible = true,
            Content = """{"title":"Les 30 ans de Awa"}""",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        });
        await context.SaveChangesAsync();

        var result = await new GuestService(context).GetPublicInvitationAsync(guest.Id);

        Assert.Equal("Les 30 ans de Awa", result?.DisplayTitle);
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

    private static void SeedRsvpBlock(Data.AdminDbContext context, Guid eventId, string content)
    {
        context.EventBlocks.Add(new EventBlock
        {
            Id = Guid.NewGuid(),
            EventId = eventId,
            BlockType = "RSVP",
            Position = 1,
            Content = content,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        });
        context.SaveChanges();
    }

    [Fact]
    public async Task SubmitPublicRsvpAsync_StoresSide_FromEventChoices()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, _, evt) = SeedEvent(context);
        var guest = SeedGuest(context, evt.Id);
        SeedRsvpBlock(context, evt.Id, """{"sideLabel":"Vous êtes invité par","sides":["Famille de la mariée","Famille du marié"]}""");
        var service = new GuestService(context);

        var result = await service.SubmitPublicRsvpAsync(guest.Id, new SubmitPublicRsvpDto { Confirmed = true, Side = " Famille du marié " });

        Assert.Equal("Famille du marié", result!.RsvpSide);
        Assert.Equal("Famille du marié", context.RsvpResponses.IgnoreQueryFilters().Single(r => r.GuestId == guest.Id).Side);
    }

    [Fact]
    public async Task SubmitPublicRsvpAsync_RejectsSide_NotOfferedByEvent()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, _, evt) = SeedEvent(context);
        var guest = SeedGuest(context, evt.Id);
        SeedRsvpBlock(context, evt.Id, """{"sides":["Famille de la mariée"]}""");
        var service = new GuestService(context);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.SubmitPublicRsvpAsync(guest.Id, new SubmitPublicRsvpDto { Confirmed = true, Side = "<script>" }));
    }

    [Fact]
    public async Task SubmitPublicRsvpAsync_DropsSide_WhenDeclining()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, _, evt) = SeedEvent(context);
        var guest = SeedGuest(context, evt.Id);
        var service = new GuestService(context);

        var result = await service.SubmitPublicRsvpAsync(guest.Id, new SubmitPublicRsvpDto { Confirmed = false, Side = "Peu importe" });

        Assert.Null(result!.RsvpSide);
    }

    [Fact]
    public async Task SubmitPublicEventRsvpAsync_CreatesGuestAndResponse_ForPublishedEvent()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, _, evt) = SeedEvent(context);
        evt.CustomFields = """{"template":"Live","ticket":{"style":"concert","note":"Tenue sombre"}}""";
        context.SaveChanges();
        SeedRsvpBlock(context, evt.Id, """{"sides":["Famille de la mariée"]}""");

        var invitation = await new GuestService(context).SubmitPublicEventRsvpAsync(evt.Slug, new SubmitPublicEventRsvpDto
        {
            FullName = "  Awa Diallo ",
            Email = " awa@example.com ",
            Confirmed = true,
            AccompanyingCount = 2,
            Message = "  Avec plaisir  ",
            Side = "Famille de la mariée",
        });

        Assert.NotNull(invitation);
        Assert.Equal(evt.Slug, invitation!.EventSlug);
        Assert.Equal("Awa Diallo", invitation.GuestFullName);
        Assert.Equal("Live", invitation.Template);
        Assert.Equal("concert", invitation.TicketStyle);
        Assert.Equal("Tenue sombre", invitation.TicketNote);
        Assert.True(invitation.RsvpConfirmed);
        Assert.Equal(2, invitation.RsvpAccompanyingCount);
        var guest = await context.Guests.IgnoreQueryFilters().SingleAsync(g => g.EventId == evt.Id);
        Assert.Equal("Awa Diallo", guest.FullName);
        Assert.Equal("awa@example.com", guest.Email);
        Assert.Equal(GuestStatus.Present, guest.Status);
        var response = await context.RsvpResponses.IgnoreQueryFilters().SingleAsync(r => r.GuestId == guest.Id);
        Assert.True(response.Confirmed);
        Assert.Equal(2, response.AccompanyingCount);
        Assert.Equal("Avec plaisir", response.Message);
        Assert.Equal("Famille de la mariée", response.Side);
    }

    [Fact]
    public async Task SubmitPublicEventRsvpAsync_RequiresContactInformation()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, _, evt) = SeedEvent(context);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            new GuestService(context).SubmitPublicEventRsvpAsync(evt.Slug, new SubmitPublicEventRsvpDto
            {
                FullName = "Awa Diallo",
                Confirmed = true,
            }));
    }

    [Fact]
    public async Task SubmitPublicEventRsvpAsync_ReturnsFalse_ForUnpublishedEvent()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, _, evt) = SeedEvent(context, EventStatus.Brouillon);

        var result = await new GuestService(context).SubmitPublicEventRsvpAsync(evt.Slug, new SubmitPublicEventRsvpDto
        {
            FullName = "Awa Diallo",
            Phone = "+221 77 000 00 00",
            Confirmed = false,
        });

        Assert.Null(result);
    }

    [Fact]
    public async Task GetPublicInvitationAsync_ReportsFirstCheckIn()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, _, evt) = SeedEvent(context);
        var guest = SeedGuest(context, evt.Id);
        var service = new GuestService(context);

        Assert.Null((await service.GetPublicInvitationAsync(guest.Id))!.CheckedInAt);

        var at = DateTimeOffset.UtcNow.AddMinutes(-5);
        context.GuestCheckins.Add(new GuestCheckin { GuestId = guest.Id, EventId = evt.Id, CheckedInAt = at });
        context.SaveChanges();

        Assert.Equal(at, (await service.GetPublicInvitationAsync(guest.Id))!.CheckedInAt);
    }
}
