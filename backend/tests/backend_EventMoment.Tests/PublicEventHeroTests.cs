using backend_EventMoment.Models;
using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

public class PublicEventHeroTests
{
    [Fact]
    public async Task GetPublicEventAsync_IncludesCustomizedHeroContent()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var eventId = Guid.NewGuid();
        context.Events.Add(new Event
        {
            Id = eventId,
            OrganizerId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid(),
            Name = "Conférence",
            Slug = "conference",
            Status = EventStatus.Publie,
            CustomFields = """{"tagline":"La conférence"}""",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        });
        context.EventBlocks.Add(new EventBlock
        {
            Id = Guid.NewGuid(),
            EventId = eventId,
            BlockType = "Hero",
            Position = 0,
            IsVisible = true,
            Content = """{"title":"Conférence annuelle","subtitle":"Découvrez nos projets","color":"#137D6A","kicker":"Elim Beverages"}""",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        });
        await context.SaveChangesAsync();

        var evt = await new GiftRegistryService(context).GetPublicEventAsync("conference");

        Assert.NotNull(evt);
        Assert.Equal("Conférence annuelle", evt.HeroTitle);
        Assert.Equal("Découvrez nos projets", evt.HeroSubtitle);
        Assert.Equal("#137D6A", evt.HeroColor);
        Assert.Equal("Elim Beverages", evt.HeroKicker);
    }
}
