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
    private const string DrawingRevision = "4";

    // Style des affiches carrée et verticale selon le type d'événement.
    private enum Mood
    {
        Default,
        Celebration, // anniversaire, soirée, remise de diplômes… : confettis
        Wedding,     // mariage : double filet doré, titre à empattements
        Spiritual,   // baptême, cérémonie religieuse : filet doux, titre à empattements
        Mourning,    // obsèques, retrait de deuil : sobre, photo en noir et blanc
        Pro,         // conférence, entreprise, école, sport, concert : bandeaux de couleur
    }

    private static Mood MoodOf(string? categoryCode) => categoryCode switch
    {
        "anniversaire" or "soiree_privee" or "graduation" or "fetes_saisons" or "baby_shower" or "reunion_familiale" => Mood.Celebration,
        "mariage" => Mood.Wedding,
        "bapteme" or "evenement_religieux" => Mood.Spiritual,
        "obseques" or "retrait_deuil" => Mood.Mourning,
        "conference" or "evenement_entreprise" or "evenement_scolaire" or "competition_sportive" or "concert" => Mood.Pro,
        _ => Mood.Default,
    };

    private static readonly SKColor Gold = new(245, 196, 81);
    private static readonly SKColor MourningAccent = new(200, 204, 216);

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
            evt.Template,
            evt.CategoryCode);
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(versionData)))[..16].ToLowerInvariant();
    }

    public static (int Width, int Height) SizeOf(SharePosterFormat format) => format switch
    {
        SharePosterFormat.Square => (1080, 1080),
        SharePosterFormat.Story => (1080, 1920),
        _ => (Width, Height),
    };

    // displayUrl : adresse écrite sur les formats carré et vertical (ex. tbfmoment.com/e/slug).
    // photo : couverture de l'événement, mise en grand sur les formats carré et vertical.
    public static byte[] Render(PublicEventDto evt, SharePosterFormat format = SharePosterFormat.Link, string? displayUrl = null,
        byte[]? photo = null)
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
        if (format == SharePosterFormat.Link)
        {
            DrawBackground(canvas, ParseAccent(evt.HeroColor ?? evt.ThemeColor), width, height);
            DrawContent(canvas, evt);
        }
        else
        {
            var story = format == SharePosterFormat.Story;
            var mood = MoodOf(evt.CategoryCode);
            var accent = mood == Mood.Mourning ? MourningAccent : ParseAccent(evt.HeroColor ?? evt.ThemeColor);
            using var picture = photo != null ? DecodeUpright(photo, Math.Max(width, height)) : null;
            float? textTop = null;
            if (picture != null)
                textTop = DrawPhotoBackground(canvas, picture, accent, width, height, story, mood);
            else
                DrawBackground(canvas, accent, width, height, frame: false, glow: mood != Mood.Mourning);
            DrawDecor(canvas, mood, accent, width, height, evt.Slug, picture != null);
            DrawPortraitContent(canvas, evt, width, height, story, displayUrl, mood, accent, textTop);
        }

        using var image = surface.Snapshot();
        using var encoded = image.Encode(SKEncodedImageFormat.Png, 95);
        return encoded.ToArray();
    }

    private static void DrawBackground(SKCanvas canvas, SKColor accent, int width, int height, bool frame = true, bool glow = true)
    {
        var glowScale = Math.Max(width, height) / (float)Width;
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

        if (glow)
        {
            using var glowPaint = new SKPaint
            {
                IsAntialias = true,
                Color = new SKColor(accent.Red, accent.Green, accent.Blue, 34),
            };
            canvas.DrawCircle(width - 160, 90, 230 * glowScale, glowPaint);
            canvas.DrawCircle(105, height - 10, 205 * glowScale, glowPaint);
        }

        if (!frame)
            return;
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
    // textTop : haut de la zone de texte quand une photo occupe le haut de l'affiche.
    private static void DrawPortraitContent(SKCanvas canvas, PublicEventDto evt, int width, int height, bool story, string? displayUrl,
        Mood mood, SKColor accent, float? textTop)
    {
        var fr = CultureInfo.GetCultureInfo("fr-FR");
        var centerX = width / 2f;
        var maxWidth = width - 170f;
        using var boldTypeface = SKTypeface.FromFamilyName("DejaVu Sans", SKFontStyle.Bold);
        using var regularTypeface = SKTypeface.FromFamilyName("DejaVu Sans", SKFontStyle.Normal);
        // Mariage, cérémonies et deuil : titre à empattements, plus solennel.
        using var titleTypeface = mood is Mood.Wedding or Mood.Spiritual or Mood.Mourning
            ? SKTypeface.FromFamilyName("DejaVu Serif", SKFontStyle.Bold)
            : SKTypeface.FromFamilyName("DejaVu Sans", SKFontStyle.Bold);
        using var accentPaint = new SKPaint { IsAntialias = true, Color = accent };
        using var brandPaint = TextPaint(new SKColor(232, 222, 251));
        using var titlePaint = TextPaint(SKColors.White);
        using var detailPaint = TextPaint(new SKColor(220, 215, 238));
        using var taglinePaint = TextPaint(new SKColor(207, 192, 230));
        using var accentTextPaint = TextPaint(accent);

        var brandY = story ? 230f : 130f;
        if (textTop != null)
        {
            // Sur la photo : marque discrète dans une pastille, et texte ombré pour rester lisible.
            brandY = story ? 150f : 110f;
            using var shadow = SKImageFilter.CreateDropShadow(0, 2, 5, 5, SKColors.Black.WithAlpha(150));
            foreach (var paint in new[] { titlePaint, detailPaint, taglinePaint, accentTextPaint })
                paint.ImageFilter = shadow;
            using var pillFont = new SKFont(boldTypeface, 24);
            var pillWidth = pillFont.MeasureText("TBF MOMENT", brandPaint) + 70;
            using var pillPaint = new SKPaint { IsAntialias = true, Color = Background.WithAlpha(165) };
            canvas.DrawRoundRect(SKRect.Create(centerX - pillWidth / 2, brandY - 33, pillWidth, 46), 23, 23, pillPaint);
            canvas.DrawCircle(centerX - pillWidth / 2 + 24, brandY - 10, 7, accentPaint);
            DrawCentered(canvas, "TBF MOMENT", centerX + 10, brandY, pillFont, brandPaint);
        }
        else
        {
            using var brandFont = new SKFont(boldTypeface, 32);
            var brandWidth = brandFont.MeasureText("TBF MOMENT", brandPaint);
            canvas.DrawCircle(centerX - brandWidth / 2 - 22, brandY - 11, 9, accentPaint);
            DrawCentered(canvas, "TBF MOMENT", centerX, brandY, brandFont, brandPaint);
            using var dividerPaint = new SKPaint { IsAntialias = true, Color = accent.WithAlpha(190), StrokeWidth = 4, StrokeCap = SKStrokeCap.Round };
            canvas.DrawLine(centerX - 60, brandY + 50, centerX + 60, brandY + 50, dividerPaint);
        }

        // Bloc central : (texte, police, peinture, espace après la ligne).
        var lines = new List<(string Text, SKFont Font, SKPaint Paint, float After)>();
        using var kickerFont = new SKFont(boldTypeface, 30);
        var kicker = Clean(WithoutDate(evt.HeroKicker, evt), 80)
            ?? (mood is Mood.Celebration or Mood.Wedding or Mood.Spiritual ? "Vous êtes invité·e" : null);
        if (kicker != null)
        {
            var kickerLines = Wrap(kicker.ToUpper(fr), kickerFont, accentTextPaint, maxWidth).Take(2).ToList();
            for (var i = 0; i < kickerLines.Count; i++)
                lines.Add((kickerLines[i], kickerFont, accentTextPaint, i == kickerLines.Count - 1 ? 30 : 8));
        }

        var title = Clean(evt.HeroTitle, 180) ?? Clean(evt.Name, 180) ?? "Événement";
        using var titleFont = new SKFont(titleTypeface, 108);
        var titleLines = new List<string>();
        // Avec photo, le texte n'a que le bas de l'affiche : titre plus petit, moins de lignes.
        var sizes = textTop == null ? new[] { 108f, 94f, 82f, 72f } : story ? new[] { 96f, 84f, 72f, 62f } : new[] { 80f, 68f, 58f, 50f };
        var fitLines = textTop == null || story ? 3 : 2;
        foreach (var size in sizes)
        {
            titleFont.Size = size;
            titleLines = Wrap(title, titleFont, titlePaint, maxWidth).ToList();
            if (titleLines.Count <= fitLines)
                break;
        }
        titleLines = titleLines.Take(textTop == null ? (story ? 5 : 4) : fitLines + 1).ToList();
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
        var regionTop = textTop ?? brandY + 110;
        // Trop long : le sous-titre puis le surtitre cèdent leur place à la date et au lieu.
        if (lines.Sum(l => l.Font.Size + l.After) > footerTop - 40 - regionTop)
            lines.RemoveAll(l => l.Font == taglineFont);
        if (lines.Sum(l => l.Font.Size + l.After) > footerTop - 40 - regionTop)
            lines.RemoveAll(l => l.Font == kickerFont);
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
            // Même écriture que les affiches carrée et verticale : « Mardi 27 octobre 2026 · 08h48 ».
            dateText = char.ToUpper(dateText[0], CultureInfo.GetCultureInfo("fr-FR")) + dateText[1..];
            if (evt.StartTime is TimeOnly time)
                dateText += " · " + time.ToString("HH'h'mm", CultureInfo.InvariantCulture);
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

    // Couverture allégée pour l'aperçu des liens : WhatsApp n'affiche la grande image que si
    // le fichier est léger (quelques centaines de Ko), alors qu'une photo de téléphone en
    // pèse plusieurs Mo. Recadrée en 1200 × 630, en JPEG. Null si l'image est illisible.
    public static byte[]? RenderCoverPreview(byte[] source)
    {
        using var picture = DecodeUpright(source, Width);
        if (picture == null)
            return null;
        using var surface = SKSurface.Create(new SKImageInfo(Width, Height));
        surface.Canvas.Clear(Background);
        DrawPhoto(surface.Canvas, picture, SKRect.Create(0, 0, Width, Height));
        return EncodeJpeg(surface, 82);
    }

    // Photo téléversée ramenée à 1600 px au plus, redressée : c'est elle qui est gardée en
    // mémoire pour l'aperçu du lien et les affiches. Null si l'image est illisible.
    public static byte[]? NormalizePhoto(byte[] source)
    {
        using var picture = DecodeUpright(source, 1600);
        if (picture == null)
            return null;
        using var surface = SKSurface.Create(new SKImageInfo(picture.Width, picture.Height));
        surface.Canvas.DrawImage(picture, 0, 0);
        return EncodeJpeg(surface, 88);
    }

    private static byte[]? EncodeJpeg(SKSurface surface, int quality)
    {
        using var snapshot = surface.Snapshot();
        using var jpeg = snapshot.Encode(SKEncodedImageFormat.Jpeg, quality);
        return jpeg?.ToArray();
    }

    // Décode une photo redressée (orientation EXIF), directement à taille réduite quand le
    // format le permet (JPEG : 1/2, 1/4, 1/8) : une photo de 24 Mpx n'occupe pas 100 Mo de
    // mémoire pour une affiche. maxSide : plus grand côté utile.
    private static SKImage? DecodeUpright(byte[] source, int maxSide)
    {
        using var stream = new SKMemoryStream(source);
        using var codec = SKCodec.Create(stream);
        if (codec == null || codec.Info.Width <= 0 || codec.Info.Height <= 0)
            return null;

        var degrees = codec.EncodedOrigin switch
        {
            SKEncodedOrigin.BottomRight or SKEncodedOrigin.BottomLeft => 180,
            SKEncodedOrigin.RightTop or SKEncodedOrigin.LeftTop => 90,
            SKEncodedOrigin.LeftBottom or SKEncodedOrigin.RightBottom => 270,
            _ => 0,
        };

        var size = codec.GetScaledDimensions(Math.Min(1f, (float)maxSide / Math.Max(codec.Info.Width, codec.Info.Height)));
        var info = new SKImageInfo(size.Width, size.Height, SKColorType.Rgba8888, SKAlphaType.Premul);
        using var bitmap = new SKBitmap(info);
        var result = codec.GetPixels(info, bitmap.GetPixels());
        if (result is not (SKCodecResult.Success or SKCodecResult.IncompleteInput))
            return null;

        // Réduction finale au besoin (formats décodés en taille réelle : PNG, WebP…).
        var scale = Math.Min(1f, (float)maxSide / Math.Max(bitmap.Width, bitmap.Height));
        var w = Math.Max(1, (int)Math.Round(bitmap.Width * scale));
        var h = Math.Max(1, (int)Math.Round(bitmap.Height * scale));
        var sideways = degrees is 90 or 270;
        using var surface = SKSurface.Create(new SKImageInfo(sideways ? h : w, sideways ? w : h));
        var canvas = surface.Canvas;
        switch (degrees)
        {
            case 90: canvas.Translate(h, 0); break;
            case 180: canvas.Translate(w, h); break;
            case 270: canvas.Translate(0, w); break;
        }
        canvas.RotateDegrees(degrees);
        using var image = SKImage.FromBitmap(bitmap);
        canvas.DrawImage(image, SKRect.Create(0, 0, w, h), new SKSamplingOptions(SKCubicResampler.Mitchell));
        return surface.Snapshot();
    }

    // Photo en plein cadre dans target ; une photo en hauteur garde plutôt son haut (visages).
    private static void DrawPhoto(SKCanvas canvas, SKImage picture, SKRect target, SKPaint? paint = null)
    {
        var scale = Math.Max(target.Width / picture.Width, target.Height / picture.Height);
        var w = picture.Width * scale;
        var h = picture.Height * scale;
        canvas.Save();
        canvas.ClipRect(target);
        canvas.DrawImage(picture,
            SKRect.Create(target.Left + (target.Width - w) / 2f, target.Top + (target.Height - h) / 3f, w, h),
            new SKSamplingOptions(SKCubicResampler.Mitchell), paint);
        canvas.Restore();
    }

    // Affiche avec photo : la photo occupe le haut (vertical) ou tout le fond (carré) et se
    // fond dans la couleur de l'événement sous le texte. Renvoie le haut de la zone de texte.
    private static float DrawPhotoBackground(SKCanvas canvas, SKImage picture, SKColor accent, int width, int height, bool story, Mood mood)
    {
        var ground = Blend(Background, accent, mood == Mood.Mourning ? 0.06f : 0.16f);
        canvas.Clear(ground);
        var photoBottom = story ? height * 0.60f : height;
        // Deuil : photo en noir et blanc.
        using var gray = mood == Mood.Mourning
            ? new SKPaint
            {
                ColorFilter = SKColorFilter.CreateColorMatrix(new[]
                {
                    0.30f, 0.59f, 0.11f, 0, 0,
                    0.30f, 0.59f, 0.11f, 0, 0,
                    0.30f, 0.59f, 0.11f, 0, 0,
                    0, 0, 0, 1, 0,
                }),
            }
            : null;
        DrawPhoto(canvas, picture, SKRect.Create(0, 0, width, photoBottom), gray);

        // Haut assombri pour la marque, bas fondu dans la couleur de fond pour le texte.
        using var top = new SKPaint
        {
            Shader = SKShader.CreateLinearGradient(new SKPoint(0, 0), new SKPoint(0, height * 0.16f),
                new[] { SKColors.Black.WithAlpha(150), SKColors.Black.WithAlpha(0) }, SKShaderTileMode.Clamp),
        };
        canvas.DrawRect(0, 0, width, height * 0.16f, top);
        var fadeStart = story ? height * 0.34f : height * 0.28f;
        var fadeEnd = story ? photoBottom : height * 0.60f;
        using var fade = new SKPaint
        {
            Shader = SKShader.CreateLinearGradient(new SKPoint(0, fadeStart), new SKPoint(0, fadeEnd),
                new[] { ground.WithAlpha(0), ground.WithAlpha(story ? (byte)255 : (byte)240) }, SKShaderTileMode.Clamp),
        };
        canvas.DrawRect(0, fadeStart, width, height - fadeStart, fade);
        return height * 0.50f;
    }

    // Décor propre au type d'événement, par-dessus le fond (avec ou sans photo).
    private static void DrawDecor(SKCanvas canvas, Mood mood, SKColor accent, int width, int height, string seed, bool withPhoto)
    {
        using var line = new SKPaint { IsAntialias = true, Style = SKPaintStyle.Stroke };
        switch (mood)
        {
            case Mood.Celebration:
            {
                line.StrokeWidth = 2;
                line.Color = accent.WithAlpha(125);
                canvas.DrawRoundRect(new SKRect(34, 34, width - 34, height - 34), 30, 30, line);
                // Confettis sur les bords, toujours les mêmes pour un même événement.
                var random = new Random(StableHash(seed));
                var colors = new[] { accent, Gold, new SKColor(226, 51, 126), SKColors.White };
                using var confetti = new SKPaint { IsAntialias = true };
                for (var i = 0; i < (withPhoto ? 22 : 34); i++)
                {
                    var x = random.NextSingle() < 0.5f
                        ? random.NextSingle() * width * 0.17f
                        : width * (0.83f + random.NextSingle() * 0.17f);
                    var y = height * 0.04f + random.NextSingle() * height * (withPhoto ? 0.5f : 0.9f);
                    confetti.Color = colors[random.Next(colors.Length)].WithAlpha((byte)random.Next(150, 240));
                    canvas.Save();
                    canvas.Translate(x, y);
                    canvas.RotateDegrees(random.Next(0, 180));
                    if (random.Next(3) == 0)
                        canvas.DrawCircle(0, 0, 6 + random.NextSingle() * 5, confetti);
                    else
                        canvas.DrawRoundRect(new SKRect(-14, -5, 14, 5), 3, 3, confetti);
                    canvas.Restore();
                }
                break;
            }
            case Mood.Wedding:
            {
                line.Color = Gold.WithAlpha(210);
                line.StrokeWidth = 2;
                canvas.DrawRect(new SKRect(34, 34, width - 34, height - 34), line);
                line.StrokeWidth = 1.2f;
                canvas.DrawRect(new SKRect(48, 48, width - 48, height - 48), line);
                using var fill = new SKPaint { IsAntialias = true, Color = Gold };
                foreach (var (x, y) in new[] { (41f, 41f), (width - 41f, 41f), (41f, height - 41f), (width - 41f, height - 41f) })
                {
                    canvas.Save();
                    canvas.Translate(x, y);
                    canvas.RotateDegrees(45);
                    canvas.DrawRect(new SKRect(-8, -8, 8, 8), fill);
                    canvas.Restore();
                }
                break;
            }
            case Mood.Spiritual:
                line.Color = Gold.WithAlpha(170);
                line.StrokeWidth = 1.6f;
                canvas.DrawRoundRect(new SKRect(40, 40, width - 40, height - 40), 60, 60, line);
                break;
            case Mood.Mourning:
                line.Color = MourningAccent.WithAlpha(150);
                line.StrokeWidth = 1.4f;
                canvas.DrawRect(new SKRect(40, 40, width - 40, height - 40), line);
                break;
            case Mood.Pro:
            {
                using var band = new SKPaint { IsAntialias = true, Color = accent };
                canvas.DrawRect(0, 0, width, 16, band);
                canvas.DrawRect(0, height - 16, width, 16, band);
                break;
            }
            default:
                line.StrokeWidth = 2;
                line.Color = accent.WithAlpha(125);
                canvas.DrawRoundRect(new SKRect(34, 34, width - 34, height - 34), 30, 30, line);
                break;
        }
    }

    private static int StableHash(string value)
    {
        var hash = 17;
        foreach (var c in value)
            hash = unchecked(hash * 31 + c);
        return hash;
    }

    private static SKColor Blend(SKColor start, SKColor end, float amount) => new(
        (byte)(start.Red + (end.Red - start.Red) * amount),
        (byte)(start.Green + (end.Green - start.Green) * amount),
        (byte)(start.Blue + (end.Blue - start.Blue) * amount));

    private static readonly SKTypeface TextTypeface = SKTypeface.FromFamilyName("DejaVu Sans");

    // Emoji et symboles absents de la police (🦋, 😍…) : retirés, sinon ils s'affichent en
    // carrés vides sur l'affiche.
    private static string? Clean(string? value, int maxLength)
    {
        var withoutControls = string.Concat((value ?? string.Empty).EnumerateRunes()
            .Where(rune => !Rune.IsControl(rune)
                && (rune.Value < 0x2000 || TextTypeface.ContainsGlyph(rune.Value)))
            .Select(rune => rune.ToString()));
        var clean = string.Join(' ', withoutControls.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
        if (clean.Length == 0)
            return null;
        return clean.Length <= maxLength ? clean : clean[..(maxLength - 1)].TrimEnd() + "…";
    }
}
