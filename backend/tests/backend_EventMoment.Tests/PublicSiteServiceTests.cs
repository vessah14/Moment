using backend_EventMoment;
using backend_EventMoment.Models;
using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

public class PublicSiteServiceTests
{
    [Fact]
    public async Task GetPublicSiteAsync_MapsEventAndVisibleBlocks()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var eventId = Guid.NewGuid();
        var evt = new Event
        {
            Id = eventId,
            OrganizerId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid(),
            Name = "Conférence",
            Slug = "conference",
            Status = EventStatus.Publie,
            CustomFields = """{"tagline":"La conférence","options":{"searchable":true}}""",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Events.Add(evt);
        context.EventLocations.Add(new Event_Location
        {
            Id = Guid.NewGuid(),
            EventId = eventId,
            Label = "Salle principale",
            Address = "Douala",
            Position = 0,
        });
        context.EventBlocks.Add(new EventBlock
        {
            Id = Guid.NewGuid(),
            EventId = eventId,
            BlockType = "Hero",
            Position = 0,
            IsVisible = true,
            Content = """{"title":"Conférence annuelle","subtitle":"Découvrez nos projets"}""",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        });
        await context.SaveChangesAsync();

        var result = await new PublicSiteService(context).GetPublicSiteAsync(evt.Slug);

        Assert.NotNull(result);
        Assert.Equal("La conférence", result.Event.Tagline);
        Assert.Equal("Conférence annuelle", result.Event.HeroTitle);
        Assert.Equal("Douala", result.Event.LocationAddress);
        Assert.True(result.Event.Searchable);
        Assert.Single(result.Blocks);
    }

    [Fact]
    public async Task GetPublicSiteAsync_ShowsOrganizerLogo_OnTheFreePlan()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var evt = new Event
        {
            Id = Guid.NewGuid(),
            OrganizerId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid(),
            Name = "Conférence de presse",
            Slug = "conference-de-presse",
            Status = EventStatus.Publie,
            CustomFields = """{"organizer":{"name":"Elim","logoUrl":"/uploads/blocks/x/logo.png"}}""",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Events.Add(evt);
        await context.SaveChangesAsync();

        // Sans abonnement : offre Free, la mention TBF MOMENT reste, le logo aussi.
        var result = await new PublicSiteService(context, new PlanService(context)).GetPublicSiteAsync(evt.Slug);

        Assert.True(result!.ShowBranding);
        Assert.Equal("Elim", result.OrganizerName);
        Assert.Equal("/uploads/blocks/x/logo.png", result.OrganizerLogoUrl);
    }

    [Fact]
    public async Task GetSearchableSitesAsync_FiltersBeforeApplyingLimit()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var organizerId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;
        context.Events.AddRange(
            CreateEvent(organizerId, categoryId, "recent-private", """{"options":{"searchable":false}}""", now),
            CreateEvent(organizerId, categoryId, "searchable", """{"options":{"searchable":true}}""", now.AddMinutes(-1)),
            CreateEvent(organizerId, categoryId, "older-searchable", """{"options":{"searchable":true}}""", now.AddMinutes(-2)));
        await context.SaveChangesAsync();

        var sites = await new PublicSiteService(context).GetSearchableSitesAsync(1);

        var site = Assert.Single(sites);
        Assert.Equal("searchable", site.Slug);
    }

    private static Event CreateEvent(Guid organizerId, Guid categoryId, string slug, string customFields, DateTimeOffset updatedAt) =>
        new()
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            CategoryId = categoryId,
            Name = slug,
            Slug = slug,
            Status = EventStatus.Publie,
            CustomFields = customFields,
            CreatedAt = updatedAt,
            UpdatedAt = updatedAt,
        };
}
