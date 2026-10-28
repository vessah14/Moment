using backend_EventMoment.Dtos;
using backend_EventMoment.Models;
using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

// Modèle Envol (présentation des vœux) : mur des vœux modéré, import de la liste du
// personnel, cocktail, statuts d'invitation et accueil des invités.
public class EnvolTests
{
    private const string RsvpBlock = """{"sideLabel":"Votre service","sides":["Commercial","Technique"],"extraLabel":"Je reste pour le cocktail"}""";

    private static Event Seed(Data.AdminDbContext context, Guid organizerId, string guestBookContent = "{}")
    {
        var evt = new Event
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            CategoryId = Guid.NewGuid(),
            Name = "Vœux Wouri Logistics",
            Slug = "voeux-wouri-" + Guid.NewGuid().ToString("N")[..6],
            Status = EventStatus.Publie,
            EventDate = new DateOnly(2027, 1, 15),
            CustomFields = """{"template":"Envol","organizer":{"name":"Wouri Logistics"}}""",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Events.Add(evt);
        void Block(string type, string content, short position) => context.EventBlocks.Add(new EventBlock
        {
            Id = Guid.NewGuid(), EventId = evt.Id, BlockType = type, Position = position, IsVisible = true,
            Content = content, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        });
        Block("Livre d'or", guestBookContent, 1);
        Block("RSVP", RsvpBlock, 2);
        context.SaveChanges();
        return evt;
    }

    [Theory]
    [InlineData("Bonne année ! Pour vos commandes, appelez-moi au 677 12 34 56.", WishAlerts.Phone)]
    [InlineData("Toutes nos offres sur www.promo-wouri.cm", WishAlerts.Link)]
    [InlineData("Voir https://exemple.org", WishAlerts.Link)]
    [InlineData("Quel ESCROC ce directeur", WishAlerts.Word)]
    [InlineData("Que 2027 nous apporte la santé, la paix et de beaux succès ensemble.", null)]
    [InlineData("Rendez-vous le 15/01/2027 à 10h00, contents de vous voir.", null)]
    public void WishAlerts_FlagPhoneNumbersLinksAndFlaggedWords(string text, string? expected)
    {
        Assert.Equal(expected, WishAlerts.Detect(text));
    }

    [Fact]
    public async Task Wish_StaysPending_UnlessAutoApproveIsOn_AndOnlyWithoutAlert()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var manual = Seed(context, organizerId);
        var service = new GuestBookService(context);
        Assert.True(await service.CreatePublicAsync(manual.Slug, new CreateGuestBookEntryDto { AuthorName = "Marie", Message = "Santé et paix !", Service = "Commercial" }));
        var pending = Assert.Single(context.GuestBookEntries.Where(g => g.EventId == manual.Id));
        Assert.Equal(GuestBookStatus.EnAttente, pending.Status);
        Assert.Equal("Commercial", pending.Service);

        var auto = Seed(context, organizerId, """{"autoApprove":true}""");
        await service.CreatePublicAsync(auto.Slug, new CreateGuestBookEntryDto { AuthorName = "Brenda", Message = "Bonne année à tous !", Service = "Inconnu" });
        await service.CreatePublicAsync(auto.Slug, new CreateGuestBookEntryDto { AuthorName = "Hervé", Message = "Appelez le 699 00 11 22 33" });
        var entries = context.GuestBookEntries.Where(g => g.EventId == auto.Id).ToList();
        var clean = entries.Single(e => e.AuthorName == "Brenda");
        Assert.Equal(GuestBookStatus.Publie, clean.Status);
        Assert.Null(clean.Service); // choix hors de la liste du bloc RSVP : ignoré
        Assert.Equal(GuestBookStatus.EnAttente, entries.Single(e => e.AuthorName == "Hervé").Status);
    }

    [Fact]
    public async Task Wall_CountsPublishedWishes_WithServiceAndOrganisation()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var evt = Seed(context, organizerId);
        context.GuestBookEntries.Add(new GuestBookEntry { Id = Guid.NewGuid(), EventId = evt.Id, AuthorName = "Marie", Message = "Santé !", Service = "Commercial", Status = GuestBookStatus.Publie, CreatedAt = DateTimeOffset.UtcNow });
        context.GuestBookEntries.Add(new GuestBookEntry { Id = Guid.NewGuid(), EventId = evt.Id, AuthorName = "X", Message = "pub", Status = GuestBookStatus.EnAttente, CreatedAt = DateTimeOffset.UtcNow });
        context.SaveChanges();

        var wall = await new PublicSiteService(context).GetWallAsync(evt.Slug);

        Assert.Equal(1, wall!.MessageCount);
        Assert.Equal("Commercial", Assert.Single(wall.Messages).Service);
        Assert.Equal("Envol", wall.Template);
        Assert.Equal(new DateOnly(2027, 1, 15), wall.EventDate);
    }

    [Fact]
    public async Task Import_SkipsDuplicates_AndTurnsServicesIntoGroups()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var evt = Seed(context, organizerId);
        context.Guests.Add(new Guest { Id = Guid.NewGuid(), EventId = evt.Id, FullName = "Paul Ekané", Phone = "+237 677 12 34 56", CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow });
        context.SaveChanges();

        var result = await new GuestService(context).ImportAsync(evt.Id, new ImportGuestsDto
        {
            Rows =
            {
                new() { FullName = "Paul E.", Service = "Commercial", Phone = "677123456" },   // même numéro
                new() { FullName = "Marie Ngo", Service = "Commercial", Phone = "699 00 00 08" },
                new() { FullName = "marie  ngo", Service = "commercial" },                     // sans numéro : même nom, doublon
                new() { FullName = "Aïcha Bello", Service = "Finances" },
                new() { FullName = "  ", Service = "Finances" },
            },
        }, evt.OrganizerId);

        Assert.Equal(2, result.Added);
        Assert.Equal(3, result.Skipped);
        Assert.Equal(2, result.Groups);
        var marie = context.Guests.Single(g => g.FullName == "Marie Ngo");
        Assert.Equal("Commercial", context.GuestGroups.Single(g => g.Id == marie.GroupId).Label);
        Assert.NotNull(marie.ImportBatchId);
    }

    [Fact]
    public async Task Rsvp_KeepsCocktailOnlyWhenOffered_AndLinkOpeningMarksTheInvitationAsSeen()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var evt = Seed(context, organizerId);
        var guest = new Guest { Id = Guid.NewGuid(), EventId = evt.Id, FullName = "Paul Ekané", CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow };
        context.Guests.Add(guest);
        context.SaveChanges();
        var service = new GuestService(context);

        var invitation = await service.GetPublicInvitationAsync(guest.Id);
        Assert.NotNull(context.Guests.Single(g => g.Id == guest.Id).InvitationOpenedAt);

        var answer = await service.SubmitPublicRsvpAsync(guest.Id, new SubmitPublicRsvpDto { Confirmed = true, Side = "Technique", Extra = true });
        Assert.True(answer!.RsvpExtra);
        Assert.Equal("Technique", answer.RsvpSide);

        var declined = await service.SubmitPublicRsvpAsync(guest.Id, new SubmitPublicRsvpDto { Confirmed = false, Extra = true });
        Assert.Null(declined!.RsvpExtra); // pas de cocktail pour une absence
        Assert.NotNull(invitation);
    }

    [Fact]
    public async Task CheckIn_SaysWhenTheGuestWasAlreadyRegistered()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var evt = Seed(context, organizerId);
        var guest = new Guest { Id = Guid.NewGuid(), EventId = evt.Id, FullName = "Brenda Ayuk", CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow };
        context.Guests.Add(guest);
        context.SaveChanges();
        var service = new GuestService(context);

        var first = await service.CheckInAsync(guest.Id, evt.OrganizerId);
        var second = await service.CheckInAsync(guest.Id, evt.OrganizerId);

        Assert.False(first.AlreadyCheckedIn);
        Assert.True(second.AlreadyCheckedIn);
        Assert.Equal(first.CheckedInAt, second.CheckedInAt);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.CheckInAsync(Guid.NewGuid(), evt.OrganizerId));
    }

    [Fact]
    public void SharePoster_UsesTheEnvolLayout()
    {
        var evt = new PublicEventDto
        {
            Name = "Vœux Wouri Logistics",
            HeroTitle = "Wouri Logistics",
            HeroKicker = "Cérémonie de présentation des vœux",
            Template = "Envol",
            EventDate = new DateOnly(2027, 1, 15),
            StartTime = new TimeOnly(10, 0),
            LocationLabel = "Hôtel Akwa Palace, Douala",
        };
        var envol = EventSharePosterRenderer.Render(evt);
        var plain = EventSharePosterRenderer.Render(new PublicEventDto
        {
            Name = evt.Name, HeroKicker = evt.HeroKicker, HeroTitle = evt.HeroTitle,
            EventDate = evt.EventDate, StartTime = evt.StartTime, LocationLabel = evt.LocationLabel,
        });

        Assert.Equal(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }, envol.Take(8));
        Assert.NotEqual(plain, envol);
        var preview = Environment.GetEnvironmentVariable("ENVOL_POSTER_PREVIEW");
        if (!string.IsNullOrEmpty(preview))
            File.WriteAllBytes(preview, envol);
    }
}
