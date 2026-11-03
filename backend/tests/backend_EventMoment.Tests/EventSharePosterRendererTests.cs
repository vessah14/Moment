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
    public void RenderCoverPreview_ShrinksALargePhotoToALightLinkPreview()
    {
        // Grande photo en hauteur, bruitée pour peser lourd comme une vraie photo.
        var random = new Random(7);
        using var bitmap = new SkiaSharp.SKBitmap(3000, 4000);
        for (var y = 0; y < bitmap.Height; y += 4)
            for (var x = 0; x < bitmap.Width; x += 4)
                bitmap.SetPixel(x, y, new SkiaSharp.SKColor((byte)random.Next(256), (byte)random.Next(256), (byte)random.Next(256)));
        using var source = bitmap.Encode(SkiaSharp.SKEncodedImageFormat.Jpeg, 95);

        var preview = EventSharePosterRenderer.RenderCoverPreview(source.ToArray());

        Assert.NotNull(preview);
        using var decoded = SkiaSharp.SKBitmap.Decode(preview);
        Assert.Equal(1200, decoded.Width);
        Assert.Equal(630, decoded.Height);
        Assert.True(preview!.Length < 600 * 1024, $"{preview.Length} octets");
    }

    [Fact]
    public void Render_PutsTheCoverPhotoOnSquareAndStoryPosters()
    {
        using var bitmap = new SkiaSharp.SKBitmap(800, 1000);
        bitmap.Erase(new SkiaSharp.SKColor(230, 60, 40));
        using var source = bitmap.Encode(SkiaSharp.SKEncodedImageFormat.Jpeg, 90);
        var photo = EventSharePosterRenderer.NormalizePhoto(source.ToArray())!;
        var evt = new PublicEventDto { Name = "Les 20 ans de Shanice 🦋", Slug = "shanice", CategoryCode = "anniversaire" };

        foreach (var format in new[] { SharePosterFormat.Square, SharePosterFormat.Story })
        {
            using var plain = SkiaSharp.SKBitmap.Decode(EventSharePosterRenderer.Render(evt, format, "tbfmoment.com/e/shanice"));
            using var withPhoto = SkiaSharp.SKBitmap.Decode(EventSharePosterRenderer.Render(evt, format, "tbfmoment.com/e/shanice", photo));
            Assert.Equal(EventSharePosterRenderer.SizeOf(format), (withPhoto.Width, withPhoto.Height));
            // Le haut de l'affiche montre la photo (rouge), pas le fond de couleur.
            var pixel = withPhoto.GetPixel(withPhoto.Width / 2, withPhoto.Height / 3);
            Assert.True(pixel.Red > 150 && pixel.Blue < 100, pixel.ToString());
            Assert.NotEqual(plain.GetPixel(plain.Width / 2, plain.Height / 3), pixel);
        }
    }

    [Fact]
    public void RenderCoverPreview_ReturnsNullForAnUnreadableFile()
    {
        Assert.Null(EventSharePosterRenderer.RenderCoverPreview(new byte[] { 1, 2, 3, 4 }));
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
