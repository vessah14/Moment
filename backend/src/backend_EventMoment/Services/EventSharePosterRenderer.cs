using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using backend_EventMoment.Dtos;
using SkiaSharp;

namespace backend_EventMoment.Services;

// Images de partage d'un événement : Link pour l'aperçu des liens (og:image), Square pour
// les discussions WhatsApp, Story pour le Statut WhatsApp. Une image ne se clique pas :
// les formats carré et vertical écrivent donc l'adresse de la page en clair.
public enum SharePosterFormat
{
    Link,
    Square,
    Story,
}

public static class EventSharePosterRenderer
{
    private const int Width = 1200;
    private const int Height = 630;
    private static readonly SKColor DefaultAccent = new(202, 112, 255);
    private static readonly SKColor Background = new(15, 16, 42);

    public static string GetVersion(PublicEventDto evt)
    {
        var versionData = string.Join('\n',
            evt.Name,
            evt.HeroTitle,
            evt.HeroSubtitle,
            evt.HeroColor,
            evt.HeroKicker,
            evt.ThemeColor,
            evt.CoverImageUrl,
            evt.EventDate?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            evt.StartTime?.ToString("HH:mm", CultureInfo.InvariantCulture),
            evt.Tagline,
            evt.LocationLabel,
            evt.LocationAddress,
            evt.Template);
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(versionData)))[..16].ToLowerInvariant();
    }

    public static (int Width, int Height) SizeOf(SharePosterFormat format) => format switch
    {
        SharePosterFormat.Square => (1080, 1080),
        SharePosterFormat.Story => (1080, 1920),
        _ => (Width, Height),
    };

    // displayUrl : adresse écrite sur les formats carré et vertical (ex. tbfmoment.com/e/slug).
    public static byte[] Render(PublicEventDto evt, SharePosterFormat format = SharePosterFormat.Link, string? displayUrl = null)
    {
        var (width, height) = SizeOf(format);
        using var surface = SKSurface.Create(new SKImageInfo(width, height));
        var canvas = surface.Canvas;
        canvas.Clear(Background);
        DrawBackground(canvas, ParseAccent(evt.HeroColor ?? evt.ThemeColor), width, height);
        if (format == SharePosterFormat.Link)
            DrawContent(canvas, evt);
        else
            DrawPortraitContent(canvas, evt, width, height, format == SharePosterFormat.Story, displayUrl);

        using var image = surface.Snapshot();
        using var encoded = image.Encode(SKEncodedImageFormat.Png, 95);
        return encoded.ToArray();
    }

    private static void DrawBackground(SKCanvas canvas, SKColor accent, int width, int height)
    {
        var glow = Math.Max(width, height) / (float)Width;
        using var backgroundPaint = new SKPaint
        {
            Shader = SKShader.CreateLinearGradient(
                new SKPoint(0, 0),
                new SKPoint(width, height),
                new[] { Background, Blend(Background, accent, 0.42f), Background },
                new[] { 0f, 0.58f, 1f },
                SKShaderTileMode.Clamp),
        };
        canvas.DrawRect(new SKRect(0, 0, width, height), backgroundPaint);

        using var glowPaint = new SKPaint
        {
            IsAntialias = true,
            Color = new SKColor(accent.Red, accent.Green, accent.Blue, 34),
        };
        canvas.DrawCircle(width - 160, 90, 230 * glow, glowPaint);
        canvas.DrawCircle(105, height - 10, 205 * glow, glowPaint);

        using var linePaint = new SKPaint
        {
            IsAntialias = true,
            Style = SKPaintStyle.Stroke,
            StrokeWidth = 2,
            Color = new SKColor(accent.Red, accent.Green, accent.Blue, 125),
        };
        canvas.DrawRoundRect(new SKRect(34, 34, width - 34, height - 34), 30, 30, linePaint);
    }

    // Carré et vertical : marque en haut, bloc de texte centré, adresse de la page en bas.
    // Le vertical laisse le bas libre (barre de réponse du Statut).
    private static void DrawPortraitContent(SKCanvas canvas, PublicEventDto evt, int width, int height, bool story, string? displayUrl)
    {
        var accent = ParseAccent(evt.HeroColor ?? evt.ThemeColor);
        var fr = CultureInfo.GetCultureInfo("fr-FR");
        var centerX = width / 2f;
        var maxWidth = width - 170f;
        using var boldTypeface = SKTypeface.FromFamilyName("DejaVu Sans", SKFontStyle.Bold);
        using var regularTypeface = SKTypeface.FromFamilyName("DejaVu Sans", SKFontStyle.Normal);
        using var accentPaint = new SKPaint { IsAntialias = true, Color = accent };
        using var brandPaint = TextPaint(new SKColor(232, 222, 251));
        using var titlePaint = TextPaint(SKColors.White);
        using var detailPaint = TextPaint(new SKColor(220, 215, 238));
        using var taglinePaint = TextPaint(new SKColor(207, 192, 230));
        using var accentTextPaint = TextPaint(accent);

        var brandY = story ? 230f : 130f;
        using var brandFont = new SKFont(boldTypeface, 32);
        var brandWidth = brandFont.MeasureText("TBF MOMENT", brandPaint);
        canvas.DrawCircle(centerX - brandWidth / 2 - 22, brandY - 11, 9, accentPaint);
        DrawCentered(canvas, "TBF MOMENT", centerX, brandY, brandFont, brandPaint);
        using (var dividerPaint = new SKPaint { IsAntialias = true, Color = accent.WithAlpha(190), StrokeWidth = 4, StrokeCap = SKStrokeCap.Round })
            canvas.DrawLine(centerX - 60, brandY + 50, centerX + 60, brandY + 50, dividerPaint);

        // Bloc central : (texte, police, peinture, espace après la ligne).
        var lines = new List<(string Text, SKFont Font, SKPaint Paint, float After)>();
        using var kickerFont = new SKFont(boldTypeface, 30);
        var kicker = Clean(evt.HeroKicker, 48);
        if (kicker != null)
            lines.Add((kicker.ToUpper(fr), kickerFont, accentTextPaint, 30));

        var title = Clean(evt.HeroTitle, 180) ?? Clean(evt.Name, 180) ?? "Événement";
        using var titleFont = new SKFont(boldTypeface, 108);
        var titleLines = new List<string>();
        foreach (var size in new[] { 108f, 94f, 82f, 72f })
        {
            titleFont.Size = size;
            titleLines = Wrap(title, titleFont, titlePaint, maxWidth).ToList();
            if (titleLines.Count <= 3)
                break;
        }
        titleLines = titleLines.Take(story ? 5 : 4).ToList();
        for (var i = 0; i < titleLines.Count; i++)
            lines.Add((titleLines[i], titleFont, titlePaint, i == titleLines.Count - 1 ? 40 : titleFont.Size * 0.18f));

        using var taglineFont = new SKFont(regularTypeface, 40);
        var tagline = Clean(evt.HeroSubtitle, 120) ?? Clean(evt.Tagline, 120);
        if (tagline != null)
        {
            var taglineLines = Wrap(tagline, taglineFont, taglinePaint, maxWidth).Take(2).ToList();
            for (var i = 0; i < taglineLines.Count; i++)
                lines.Add((taglineLines[i], taglineFont, taglinePaint, i == taglineLines.Count - 1 ? 44 : 12));
        }

        using var dateFont = new SKFont(boldTypeface, 42);
        using var detailFont = new SKFont(regularTypeface, 38);
        if (evt.EventDate is DateOnly date)
        {
            var dateText = date.ToDateTime(TimeOnly.MinValue).ToString("dddd d MMMM yyyy", fr);
            dateText = char.ToUpper(dateText[0], fr) + dateText[1..];
            var timeText = evt.StartTime is TimeOnly time ? time.ToString("HH'h'mm", CultureInfo.InvariantCulture) : null;
            // Carré : date et heure sur une ligne, pour garder la place du lieu.
            if (!story && timeText != null)
                lines.Add(($"{dateText} · {timeText}", dateFont, titlePaint, 14));
            else
            {
                lines.Add((dateText, dateFont, titlePaint, 14));
                if (timeText != null)
                    lines.Add(("à " + timeText, detailFont, detailPaint, 14));
            }
        }
        var location = Clean(
            !string.IsNullOrWhiteSpace(evt.LocationLabel) && evt.LocationLabel != "Lieu principal" ? evt.LocationLabel : evt.LocationAddress,
            90);
        if (location != null)
            foreach (var line in Wrap(location, detailFont, detailPaint, maxWidth).Take(2))
                lines.Add((line, detailFont, detailPaint, 10));

        var footerTop = story ? height - 420f : height - 190f;
        var regionTop = brandY + 110;
        // Trop long : le sous-titre cède sa place à la date et au lieu, plus utiles.
        if (lines.Sum(l => l.Font.Size + l.After) > footerTop - 40 - regionTop)
            lines.RemoveAll(l => l.Font == taglineFont);
        var blockHeight = lines.Sum(l => l.Font.Size + l.After);
        var y = regionTop + Math.Max(0, (footerTop - 40 - regionTop - blockHeight) / 2);
        foreach (var (text, font, paint, after) in lines)
        {
            y += font.Size;
            if (y > footerTop - 30)
                break;
            DrawCentered(canvas, text, centerX, y, font, paint);
            y += after;
        }

        if (!string.IsNullOrWhiteSpace(displayUrl))
        {
            using var callFont = new SKFont(boldTypeface, 30);
            using var urlFont = new SKFont(boldTypeface, 40);
            urlFont.Size = Math.Min(40, 40 * maxWidth / Math.Max(1, urlFont.MeasureText(displayUrl, titlePaint)));
            DrawCentered(canvas, "Toutes les infos et votre réponse :", centerX, footerTop + 40, callFont, accentTextPaint);
            DrawCentered(canvas, displayUrl, centerX, footerTop + 100, urlFont, titlePaint);
        }
    }

    private static void DrawContent(SKCanvas canvas, PublicEventDto evt)
    {
        using var accentPaint = new SKPaint { IsAntialias = true, Color = ParseAccent(evt.HeroColor ?? evt.ThemeColor) };
        using var boldTypeface = SKTypeface.FromFamilyName("DejaVu Sans", SKFontStyle.Bold);
        using var regularTypeface = SKTypeface.FromFamilyName("DejaVu Sans", SKFontStyle.Normal);
        using var brandFont = new SKFont(boldTypeface, 24);
        using var titleFont = new SKFont(boldTypeface, 76);
        using var detailFont = new SKFont(regularTypeface, 28);
        using var taglineFont = new SKFont(regularTypeface, 30);
        using var accentFont = new SKFont(boldTypeface, 21);
        using var brandPaint = TextPaint(new SKColor(232, 222, 251));
        using var titlePaint = TextPaint(SKColors.White);
        using var detailPaint = TextPaint(new SKColor(220, 215, 238));
        using var taglinePaint = TextPaint(new SKColor(207, 192, 230));
        using var accentTextPaint = TextPaint(ParseAccent(evt.HeroColor ?? evt.ThemeColor));

        const float centerX = Width / 2f;
        canvas.DrawCircle(centerX - 112, 91, 7, accentPaint);
        canvas.DrawText("TBF MOMENT", centerX - 92, 99, SKTextAlign.Left, brandFont, brandPaint);

        var kicker = Clean(evt.HeroKicker, 48);
        if (!string.IsNullOrWhiteSpace(kicker))
        {
            using var kickerFont = new SKFont(boldTypeface, 18);
            using var kickerPaint = TextPaint(ParseAccent(evt.HeroColor ?? evt.ThemeColor));
            DrawCentered(canvas, kicker.ToUpper(CultureInfo.GetCultureInfo("fr-FR")), centerX, 205, kickerFont, kickerPaint);
        }

        var title = Clean(evt.HeroTitle, 180) ?? Clean(evt.Name, 180) ?? "Événement";
        var titleLines = Wrap(title, titleFont, titlePaint, 930).Take(3).ToList();
        var titleSize = titleLines.Count == 1 ? 76 : titleLines.Count == 2 ? 66 : 56;
        if (!string.IsNullOrWhiteSpace(kicker))
            titleSize -= 6;
        titleFont.Size = titleSize;
        titleLines = Wrap(title, titleFont, titlePaint, 930).Take(3).ToList();
        var titleLineHeight = titleSize * 1.18f;
        var titleTop = !string.IsNullOrWhiteSpace(kicker)
            ? titleLines.Count == 1 ? 300f : titleLines.Count == 2 ? 268f : 236f
            : titleLines.Count == 1 ? 286f : titleLines.Count == 2 ? 245f : 215f;
        for (var index = 0; index < titleLines.Count; index++)
            DrawCentered(canvas, titleLines[index], centerX, titleTop + index * titleLineHeight, titleFont, titlePaint);

        var tagline = Clean(evt.HeroSubtitle, 100) ?? Clean(evt.Tagline, 100);
        var detailsY = titleTop + titleLines.Count * titleLineHeight + 24;
        if (!string.IsNullOrWhiteSpace(tagline))
        {
            DrawCentered(canvas, tagline, centerX, detailsY, taglineFont, taglinePaint);
            detailsY += 48;
        }

        var details = new List<string>();
        if (evt.EventDate is DateOnly date)
        {
            var dateText = date.ToDateTime(TimeOnly.MinValue)
                .ToString("dddd d MMMM yyyy", CultureInfo.GetCultureInfo("fr-FR"));
            if (evt.StartTime is TimeOnly time)
                dateText += " · " + time.ToString("HH:mm", CultureInfo.InvariantCulture);
            details.Add(dateText);
        }

        var location = Clean(
            !string.IsNullOrWhiteSpace(evt.LocationLabel) && evt.LocationLabel != "Lieu principal"
                ? evt.LocationLabel
                : evt.LocationAddress,
            80);
        if (!string.IsNullOrWhiteSpace(location))
            details.Add(location);

        var detailText = string.Join("   ·   ", details);
        if (!string.IsNullOrWhiteSpace(detailText))
        {
            DrawCentered(canvas, detailText, centerX, Math.Min(detailsY, 548), detailFont, detailPaint);
        }
        else if (!string.IsNullOrWhiteSpace(evt.Template))
        {
            DrawCentered(canvas, Clean(evt.Template, 48)!, centerX, Math.Min(detailsY, 548), accentFont, accentTextPaint);
        }

        using var dividerPaint = new SKPaint
        {
            IsAntialias = true,
            Color = new SKColor(accentPaint.Color.Red, accentPaint.Color.Green, accentPaint.Color.Blue, 190),
            StrokeWidth = 3,
            StrokeCap = SKStrokeCap.Round,
        };
        canvas.DrawLine(centerX - 45, 155, centerX + 45, 155, dividerPaint);
    }

    private static SKPaint TextPaint(SKColor color) => new()
    {
        IsAntialias = true,
        Color = color,
    };

    private static void DrawCentered(SKCanvas canvas, string text, float centerX, float baseline, SKFont font, SKPaint paint)
    {
        canvas.DrawText(text, centerX, baseline, SKTextAlign.Center, font, paint);
    }

    private static IEnumerable<string> Wrap(string text, SKFont font, SKPaint paint, float maxWidth)
    {
        var words = (Clean(text, 180) ?? "Événement").Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var line = new StringBuilder();
        foreach (var word in words)
        {
            var candidate = line.Length == 0 ? word : $"{line} {word}";
            if (line.Length > 0 && font.MeasureText(candidate, paint) > maxWidth)
            {
                yield return line.ToString();
                line.Clear();
                line.Append(word);
            }
            else
            {
                if (line.Length > 0)
                    line.Append(' ');
                line.Append(word);
            }
        }

        if (line.Length > 0)
            yield return line.ToString();
    }

    private static SKColor ParseAccent(string? value)
    {
        if (!string.IsNullOrWhiteSpace(value)
            && value.Length is 7 or 9
            && value[0] == '#'
            && uint.TryParse(value.AsSpan(1), NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var hex))
        {
            if (value.Length == 7)
                return new SKColor((byte)(hex >> 16), (byte)(hex >> 8), (byte)hex);
            return new SKColor((byte)(hex >> 24), (byte)(hex >> 16), (byte)(hex >> 8), (byte)hex);
        }

        return DefaultAccent;
    }

    private static SKColor Blend(SKColor start, SKColor end, float amount) => new(
        (byte)(start.Red + (end.Red - start.Red) * amount),
        (byte)(start.Green + (end.Green - start.Green) * amount),
        (byte)(start.Blue + (end.Blue - start.Blue) * amount));

    private static string? Clean(string? value, int maxLength)
    {
        var withoutControls = string.Concat((value ?? string.Empty).Where(character => !char.IsControl(character)));
        var clean = string.Join(' ', withoutControls.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
        if (clean.Length == 0)
            return null;
        return clean.Length <= maxLength ? clean : clean[..(maxLength - 1)].TrimEnd() + "…";
    }
}
