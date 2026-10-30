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
    // À incrémenter quand le dessin change : l'adresse versionnée de l'affiche (mise en cache
    // 7 jours par WhatsApp et les navigateurs) change alors aussi.
    private const string DrawingRevision = "2";

    public static string GetVersion(PublicEventDto evt)
    {
        var versionData = string.Join('\n',
            DrawingRevision,
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
        // Modèle Envol : aperçu bleu nuit et or aux couleurs de l'organisation (lien seulement).
        if (format == SharePosterFormat.Link && string.Equals(evt.Template, "Envol", StringComparison.OrdinalIgnoreCase))
        {
            DrawEnvol(canvas, evt);
            using var envolImage = surface.Snapshot();
            using var envolPng = envolImage.Encode(SKEncodedImageFormat.Png, 95);
            return envolPng.ToArray();
        }
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
        var kicker = Clean(WithoutDate(evt.HeroKicker, evt), 80);
        if (kicker != null)
        {
            var kickerLines = Wrap(kicker.ToUpper(fr), kickerFont, accentTextPaint, maxWidth).Take(2).ToList();
            for (var i = 0; i < kickerLines.Count; i++)
                lines.Add((kickerLines[i], kickerFont, accentTextPaint, i == kickerLines.Count - 1 ? 30 : 8));
        }

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
        var tagline = Clean(WithoutDate(evt.HeroSubtitle, evt), 120) ?? Clean(WithoutDate(evt.Tagline, evt), 120);
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

    public static string? WithoutDate(string? text, PublicEventDto evt)
    {
        if (string.IsNullOrWhiteSpace(text) || evt.EventDate is not DateOnly date)
            return text;
        var year = date.Year.ToString(CultureInfo.InvariantCulture);
        var time = evt.StartTime is TimeOnly start ? start : (TimeOnly?)null;
        bool RepeatsDate(string part) =>
            part.Contains(year, StringComparison.Ordinal)
            || (time is TimeOnly t
                && (part.Contains(t.ToString("HH:mm", CultureInfo.InvariantCulture), StringComparison.Ordinal)
                    || part.Contains(t.ToString("HH'h'mm", CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)));
        var kept = text.Split('·', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .Where(part => !RepeatsDate(part))
            .ToList();
        return kept.Count == 0 ? null : string.Join(" · ", kept);
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

        var kicker = Clean(WithoutDate(evt.HeroKicker, evt), 80);
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

        var tagline = Clean(WithoutDate(evt.HeroSubtitle, evt), 100) ?? Clean(WithoutDate(evt.Tagline, evt), 100);
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

    private static readonly SKColor EnvolNight = new(15, 31, 68);
    private static readonly SKColor EnvolIvory = new(247, 242, 231);
    private static readonly SKColor EnvolGold = new(217, 181, 103);

    // Aperçu Envol (maquette partage.html) : sceau guilloché, titre, année dorée, date et
    // lieu. Tout est centré : WhatsApp recadre parfois l'image en carré.
    private static void DrawEnvol(SKCanvas canvas, PublicEventDto evt)
    {
        var org = ParseAccent(evt.HeroColor ?? evt.ThemeColor);
        if (org == DefaultAccent) org = EnvolNight;
        canvas.Clear(org);
        const float centerX = Width / 2f;

        // Deux sceaux en filigrane qui débordent des coins, puis le sceau central.
        DrawSeal(canvas, 130, 110, 310, EnvolGold.WithAlpha(26), 1.2f, bare: true, org);
        DrawSeal(canvas, Width - 110, Height - 70, 310, EnvolGold.WithAlpha(26), 1.2f, bare: true, org);
        DrawSeal(canvas, centerX, 130, 66, EnvolGold, 0.6f, bare: false, org);

        using var serifBold = SKTypeface.FromFamilyName("DejaVu Serif", SKFontStyle.Bold);
        using var sansBold = SKTypeface.FromFamilyName("DejaVu Sans", SKFontStyle.Bold);
        using var sans = SKTypeface.FromFamilyName("DejaVu Sans", SKFontStyle.Normal);
        using var ivoryPaint = TextPaint(EnvolIvory);
        using var softPaint = TextPaint(new SKColor(205, 209, 222));
        var fr = CultureInfo.GetCultureInfo("fr-FR");

        var y = 236f;
        // En-tête Envol : le titre de la page est le nom de l'organisation, le surtitre celui
        // de la cérémonie (« Présentation des vœux »).
        var kicker = Clean(evt.HeroTitle, 60) ?? Clean(evt.Name, 60);
        if (kicker != null)
        {
            using var kickerFont = new SKFont(sansBold, 17);
            DrawSpaced(canvas, kicker.ToUpper(fr), centerX, y, kickerFont, ivoryPaint, 3.5f);
            y += 16;
        }

        var title = Clean(evt.HeroKicker, 120) ?? "Cérémonie de présentation des vœux";
        using var titleFont = new SKFont(serifBold, 48);
        var titleLines = Wrap(title, titleFont, ivoryPaint, 1000).ToList();
        if (titleLines.Count > 1)
        {
            titleFont.Size = 40;
            titleLines = Wrap(title, titleFont, ivoryPaint, 1000).Take(2).ToList();
        }
        foreach (var line in titleLines)
        {
            y += titleFont.Size + 6;
            DrawCentered(canvas, line, centerX, y, titleFont, ivoryPaint);
        }

        // Année en dégradé or, sauf si le titre la donne déjà.
        var year = evt.EventDate?.Year.ToString(CultureInfo.InvariantCulture);
        if (year != null && !title.Contains(year, StringComparison.Ordinal))
        {
            using var yearFont = new SKFont(serifBold, titleLines.Count > 1 ? 104 : 124);
            y += yearFont.Size * 0.95f;
            var w = yearFont.MeasureText(year, ivoryPaint);
            using var yearPaint = new SKPaint
            {
                IsAntialias = true,
                Shader = SKShader.CreateLinearGradient(
                    new SKPoint(centerX - w / 2, y - yearFont.Size), new SKPoint(centerX + w / 2, y),
                    new[] { new SKColor(184, 137, 46), new SKColor(241, 217, 160), EnvolGold, new SKColor(154, 111, 30) },
                    new[] { 0f, 0.42f, 0.52f, 1f }, SKShaderTileMode.Clamp),
            };
            DrawCentered(canvas, year, centerX, y, yearFont, yearPaint);
        }

        // Filet et losange.
        y += 26;
        using (var gold = new SKPaint { IsAntialias = true, Color = EnvolGold, StrokeWidth = 1.2f })
        {
            canvas.DrawLine(centerX - 100, y, centerX - 12, y, gold);
            canvas.DrawLine(centerX + 12, y, centerX + 100, y, gold);
            using var diamond = new SKPath();
            diamond.MoveTo(centerX, y - 5);
            diamond.LineTo(centerX + 5, y);
            diamond.LineTo(centerX, y + 5);
            diamond.LineTo(centerX - 5, y);
            diamond.Close();
            canvas.DrawPath(diamond, gold);
        }

        var details = new List<string>();
        if (evt.EventDate is DateOnly date)
        {
            var dateText = date.ToDateTime(TimeOnly.MinValue).ToString("dddd d MMMM yyyy", fr);
            dateText = char.ToUpper(dateText[0], fr) + dateText[1..];
            if (evt.StartTime is TimeOnly time)
                dateText += " · " + time.ToString("HH'h'mm", CultureInfo.InvariantCulture);
            details.Add(dateText);
        }
        var location = Clean(
            !string.IsNullOrWhiteSpace(evt.LocationLabel) && evt.LocationLabel != "Lieu principal" ? evt.LocationLabel : evt.LocationAddress, 60);
        if (location != null) details.Add(location);
        if (details.Count > 0)
        {
            using var detailFont = new SKFont(sans, 24);
            var text = string.Join(" · ", details);
            detailFont.Size = Math.Min(24, 24 * 1060 / Math.Max(1, detailFont.MeasureText(text, ivoryPaint)));
            y += 58;
            DrawCentered(canvas, text, centerX, Math.Min(y, 572), detailFont, ivoryPaint);
        }
        using var footFont = new SKFont(sans, 17);
        DrawCentered(canvas, "Invitation officielle · tbfmoment.com", centerX, 606, footFont, softPaint);
    }

    // Sceau guilloché (maquette envol.js), dessiné sur une base de 200 : bord festonné, six
    // ondes à douze lobes décalées de 5°, disque central ivoire (sauf en filigrane).
    private static void DrawSeal(SKCanvas canvas, float cx, float cy, float radius, SKColor stroke, float strokeWidth, bool bare, SKColor background)
    {
        var scale = radius / 100f;
        using var paint = new SKPaint { IsAntialias = true, Style = SKPaintStyle.Stroke, Color = stroke, StrokeWidth = strokeWidth };
        SKPath Guilloche(float r0, float amp, int k, int n, float rotation)
        {
            var path = new SKPath();
            for (var i = 0; i < n; i++)
            {
                var t = 2 * Math.PI * i / n;
                var r = r0 + amp * Math.Sin(k * t);
                var a = t + rotation * Math.PI / 180;
                var point = new SKPoint(cx + (float)(r * Math.Cos(a)) * scale, cy + (float)(r * Math.Sin(a)) * scale);
                if (i == 0) path.MoveTo(point); else path.LineTo(point);
            }
            path.Close();
            return path;
        }
        using (var edge = Guilloche(97, 2.2f, 60, 180, 0))
        {
            paint.StrokeWidth = strokeWidth * 1.6f;
            canvas.DrawPath(edge, paint);
        }
        paint.StrokeWidth = strokeWidth;
        foreach (var angle in new[] { 0, 5, 10, 15, 20, 25 })
        {
            using var wave = Guilloche(78, 16, 12, 144, angle);
            canvas.DrawPath(wave, paint);
        }
        if (bare) return;
        canvas.DrawCircle(cx, cy, 61 * scale, paint);
        using var fill = new SKPaint { IsAntialias = true, Color = EnvolIvory };
        canvas.DrawCircle(cx, cy, 57 * scale, fill);
        using var dash = SKPathEffect.CreateDash(new[] { 3f, 3f }, 0);
        using var inner = new SKPaint { IsAntialias = true, Style = SKPaintStyle.Stroke, Color = background.WithAlpha(150), StrokeWidth = 1, PathEffect = dash };
        canvas.DrawCircle(cx, cy, 30 * scale, inner);
    }

    // Texte en capitales espacées (sur-titre de la maquette).
    private static void DrawSpaced(SKCanvas canvas, string text, float centerX, float baseline, SKFont font, SKPaint paint, float spacing)
    {
        var widths = text.Select(c => font.MeasureText(c.ToString(), paint)).ToArray();
        var x = centerX - (widths.Sum() + spacing * (text.Length - 1)) / 2;
        for (var i = 0; i < text.Length; i++)
        {
            canvas.DrawText(text[i].ToString(), x, baseline, SKTextAlign.Left, font, paint);
            x += widths[i] + spacing;
        }
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
