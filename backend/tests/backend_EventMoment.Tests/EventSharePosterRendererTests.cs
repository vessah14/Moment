using backend_EventMoment.Dtos;
using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

public class EventSharePosterRendererTests
{
    [Fact]
    public void Render_ReturnsPngWithEventSpecificContent()
    {
        var first = EventSharePosterRenderer.Render(new PublicEventDto
        {
            Name = "Conférence de presse",
            ThemeColor = "#137D6A",
            EventDate = new DateOnly(2026, 12, 15),
            LocationLabel = "Dakar",
        });
        var second = EventSharePosterRenderer.Render(new PublicEventDto
        {
            Name = "Anniversaire de Mariam",
            ThemeColor = "#AA3377",
        });

        Assert.Equal(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }, first.Take(8));
        Assert.NotEqual(first, second);
    }

    [Fact]
    public void GetVersion_ChangesWhenEventAppearanceChanges()
    {
        var evt = new PublicEventDto { Name = "Conférence de presse", HeroColor = "#137D6A" };
        var original = EventSharePosterRenderer.GetVersion(evt);

        evt.HeroColor = "#AA3377";

        Assert.NotEqual(original, EventSharePosterRenderer.GetVersion(evt));
    }
}
