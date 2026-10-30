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
    public void WithoutDate_DropsPartsRepeatingTheDateOrTime()
    {
        var evt = new PublicEventDto
        {
            Name = "Conférence",
            EventDate = new DateOnly(2026, 10, 27),
            StartTime = new TimeOnly(8, 48),
        };

        Assert.Equal("Conférence, séminaire et atelier",
            EventSharePosterRenderer.WithoutDate("Conférence, séminaire et atelier · 27 octobre 2026", evt));
        Assert.Null(EventSharePosterRenderer.WithoutDate("27 oct. 2026 · 08:48", evt));
        Assert.Equal("Thème : le recyclage",
            EventSharePosterRenderer.WithoutDate("Thème : le recyclage", evt));
        Assert.Equal("27 octobre 2026",
            EventSharePosterRenderer.WithoutDate("27 octobre 2026", new PublicEventDto { Name = "Sans date" }));
    }

    [Theory]
    [InlineData(SharePosterFormat.Link, 1200, 630)]
    [InlineData(SharePosterFormat.Square, 1080, 1080)]
    [InlineData(SharePosterFormat.Story, 1080, 1920)]
    public void Render_UsesTheSizeOfEachShareFormat(SharePosterFormat format, int width, int height)
    {
        var png = EventSharePosterRenderer.Render(new PublicEventDto
        {
            Name = "Dot de Brenda et Paul, une très longue journée de fête en famille à Bafoussam",
            HeroKicker = "Dot",
            HeroSubtitle = "Toute la famille est invitée",
            EventDate = new DateOnly(2026, 12, 19),
            StartTime = new TimeOnly(14, 30),
            LocationLabel = "Salle des fêtes de Bafoussam",
        }, format, "tbfmoment.com/e/dot-brenda-et-paul");

        using var bitmap = SkiaSharp.SKBitmap.Decode(png);
        Assert.Equal((width, height), (bitmap.Width, bitmap.Height));
        var outDir = Environment.GetEnvironmentVariable("POSTER_PREVIEW_DIR");
        if (!string.IsNullOrEmpty(outDir))
            File.WriteAllBytes(Path.Combine(outDir, $"{format}.png"), png);
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
