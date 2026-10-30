using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Memory;

namespace backend_EventMoment.Controllers
{
    // Lien de partage d'un site d'événement : https://api.tbfmoment.com/share/e/{slug}.
    // Le site est une application monopage : les robots de WhatsApp, Facebook, LinkedIn…
    // n'exécutent pas le JavaScript et ne verraient que l'aperçu générique de l'accueil.
    // Cette page leur sert les vraies balises (titre, description, couverture), puis envoie
    // immédiatement les visiteurs sur le site. Événements publiés et non suspendus uniquement.
    [ApiController]
    [AllowAnonymous]
    [EnableRateLimiting("public-read")]
    public class ShareController : ControllerBase
    {
        private readonly IGiftRegistryService _events;
        private readonly IUploadStorage _uploads;
        private readonly IConfiguration _config;
        private readonly IEventStatsService _stats;
        private readonly ILogger<ShareController> _logger;
        private readonly IMemoryCache _cache;

        // Une affiche se dessine en 1 à 3 s : trop lent pour WhatsApp, qui abandonne la carte
        // d'aperçu si l'image tarde. Elle est gardée en mémoire, la version de l'événement
        // (titre, date, lieu, couleur) faisant partie de la clé.
        private static readonly MemoryCacheEntryOptions PosterCacheOptions = new()
        {
            SlidingExpiration = TimeSpan.FromHours(12),
            AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(3),
        };

        // Robots qui lisent l'aperçu quand le lien est collé dans une conversation ou une
        // publication : chaque passage correspond à un partage du lien.
        private static readonly string[] SocialBots =
        {
            "WhatsApp", "facebookexternalhit", "Facebot", "TelegramBot", "Twitterbot",
            "LinkedInBot", "Slackbot", "Discordbot", "SkypeUriPreview", "Pinterest", "Snapchat"
        };

        public ShareController(IGiftRegistryService events, IUploadStorage uploads, IConfiguration config,
            IEventStatsService stats, ILogger<ShareController> logger, IMemoryCache cache)
        {
            _cache = cache;
            _events = events;
            _uploads = uploads;
            _config = config;
            _stats = stats;
            _logger = logger;
        }

        [HttpGet("share/e/{slug}")]
        public async Task<IActionResult> Event(string slug)
        {
            var site = (_config["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
            // Slug généré par la plateforme : lettres minuscules, chiffres et tirets.
            var evt = IsValidSlug(slug)
                ? await _events.GetPublicEventAsync(slug)
                : null;
            if (evt == null)
                return Html(404, RedirectPage("Événement introuvable · TBF Moment", "Cet événement n'existe pas ou n'est plus en ligne.", site + "/", null, null, site + "/"));

            await CountSocialShareAsync(evt.Slug);

            var eventUrl = $"{site}/e/{Uri.EscapeDataString(evt.Slug)}";
            // Le site renvoie les robots d'aperçu ici (frontend/vercel.json) : l'adresse lisible
            // de l'événement sert donc aussi d'og:url.
            var shareUrl = eventUrl;
            var cover = CoverUrl(evt.CoverImageUrl);
            var image = cover ?? PosterUrl(evt);

            var details = new List<string>();
            if (evt.EventDate is DateOnly date)
                details.Add("Le " + date.ToString("dddd d MMMM yyyy", CultureInfo.GetCultureInfo("fr-FR")));
            var where = !string.IsNullOrWhiteSpace(evt.LocationLabel) && evt.LocationLabel != "Lieu principal" ? evt.LocationLabel : evt.LocationAddress;
            if (!string.IsNullOrWhiteSpace(where))
                details.Add("à " + where);
            var description = Clean(evt.Description)
                ?? Clean(evt.HeroSubtitle)
                ?? Clean(string.Join(" · ", new[] { evt.Tagline }.Concat(details).Where(s => !string.IsNullOrWhiteSpace(s))))
                ?? $"Retrouvez toutes les informations de « {evt.Name} » sur son site.";

            var title = Clean(evt.HeroTitle) ?? evt.Name;
            return Html(200, RedirectPage(title, description, eventUrl, shareUrl, image, eventUrl, posterImage: cover == null));
        }

        [HttpGet("share/e/{slug}/poster.png")]
        public async Task<IActionResult> Poster(string slug)
        {
            var evt = IsValidSlug(slug) ? await _events.GetPublicEventAsync(slug) : null;
            if (evt == null)
                return NotFound();

            // Adresse versionnée (?v=…, celle des balises d'aperçu) : son contenu ne change jamais.
            var version = EventSharePosterRenderer.GetVersion(evt);
            Response.Headers.CacheControl = Request.Query["v"] == version
                ? "public, max-age=604800, immutable"
                : "public, max-age=300";
            var png = _cache.GetOrCreate($"share-poster:{evt.Slug}:link:{version}", entry =>
            {
                entry.SetOptions(PosterCacheOptions);
                return EventSharePosterRenderer.Render(evt);
            })!;
            return File(png, "image/png");
        }

        // Kit de partage : image carrée (discussions WhatsApp) ou verticale (Statut), avec
        // l'adresse de la page écrite en clair.
        [HttpGet("share/e/{slug}/poster-{format}.png")]
        public async Task<IActionResult> SharePoster(string slug, string format)
        {
            var kind = format switch
            {
                "square" => SharePosterFormat.Square,
                "story" => SharePosterFormat.Story,
                _ => (SharePosterFormat?)null,
            };
            var evt = kind != null && IsValidSlug(slug) ? await _events.GetPublicEventAsync(slug) : null;
            if (evt == null)
                return NotFound();

            var site = (_config["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
            var displayUrl = $"{new Uri(site).Host}/e/{evt.Slug}";
            Response.Headers.CacheControl = "public, max-age=300";
            var png = _cache.GetOrCreate(
                $"share-poster:{evt.Slug}:{format}:{EventSharePosterRenderer.GetVersion(evt)}:{displayUrl}", entry =>
                {
                    entry.SetOptions(PosterCacheOptions);
                    return EventSharePosterRenderer.Render(evt, kind!.Value, displayUrl);
                })!;
            return File(png, "image/png", $"{evt.Slug}-{format}.png");
        }

        private static bool IsValidSlug(string slug) =>
            slug.Length <= 200 && slug.All(c => char.IsAsciiLetterLower(c) || char.IsAsciiDigit(c) || c == '-');

        private string PosterUrl(Dtos.PublicEventDto evt)
        {
            var version = EventSharePosterRenderer.GetVersion(evt);
            return $"{Request.Scheme}://{Request.Host}{Request.PathBase}/share/e/{Uri.EscapeDataString(evt.Slug)}/poster.png?v={version}";
        }

        private async Task CountSocialShareAsync(string slug)
        {
            var agent = Request.Headers.UserAgent.ToString();
            if (!SocialBots.Any(bot => agent.Contains(bot, StringComparison.OrdinalIgnoreCase))) return;
            try
            {
                await _stats.RecordAsync(slug, EventStatKind.Share);
            }
            catch (Exception ex)
            {
                // Une statistique ne doit jamais empêcher l'aperçu du lien.
                _logger.LogWarning(ex, "Partage non comptabilisé pour {Slug}", slug);
            }
        }

        // Couverture absolue : Cloudinary (déjà absolue) ou fichier local servi par l'API.
        // Seules les couvertures téléversées sur la plateforme sont reprises.
        private string? CoverUrl(string? cover)
        {
            if (string.IsNullOrWhiteSpace(cover) || !_uploads.IsUploadedCover(cover))
                return null;
            return cover.StartsWith("https://", StringComparison.Ordinal)
                ? cover
                : $"{Request.Scheme}://{Request.Host}{Request.PathBase}{cover}";
        }

        private static string? Clean(string? text)
        {
            var flat = string.Join(' ', (text ?? string.Empty).Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
            if (flat.Length == 0) return null;
            return flat.Length <= 200 ? flat : flat[..199].TrimEnd() + "…";
        }

        private ContentResult Html(int status, string html)
        {
            // Pas de cache long : un organisateur peut changer sa couverture ou son titre.
            Response.Headers.CacheControl = "public, max-age=300";
            return new ContentResult { StatusCode = status, ContentType = "text/html; charset=utf-8", Content = html };
        }

        private static string RedirectPage(string title, string description, string target, string? shareUrl, string? image, string canonical,
            bool posterImage = false)
        {
            // Seuls les caractères spéciaux HTML sont encodés : les accents restent lisibles.
            string E(string value) => value.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace("\"", "&quot;").Replace("'", "&#39;");
            var html = new StringBuilder();
            html.Append("<!doctype html><html lang=\"fr\"><head><meta charset=\"utf-8\">");
            html.Append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">");
            html.Append($"<title>{E(title)}</title>");
            html.Append($"<meta name=\"description\" content=\"{E(description)}\">");
            // Le site de l'événement est la page de référence ; ce lien ne doit pas être indexé.
            html.Append("<meta name=\"robots\" content=\"noindex, follow\">");
            html.Append($"<link rel=\"canonical\" href=\"{E(canonical)}\">");
            html.Append("<meta property=\"og:site_name\" content=\"TBF Moment\"><meta property=\"og:locale\" content=\"fr_FR\"><meta property=\"og:type\" content=\"website\">");
            html.Append($"<meta property=\"og:title\" content=\"{E(title)}\"><meta property=\"og:description\" content=\"{E(description)}\">");
            // og:url : l'adresse de l'événement ; le site renvoie les robots d'aperçu vers cette page.
            if (shareUrl != null) html.Append($"<meta property=\"og:url\" content=\"{E(shareUrl)}\">");
            if (image != null)
            {
                html.Append($"<meta property=\"og:image\" content=\"{E(image)}\"><meta property=\"og:image:secure_url\" content=\"{E(image)}\">");
                html.Append($"<meta property=\"og:image:alt\" content=\"{E(title)}\"><meta name=\"twitter:image\" content=\"{E(image)}\">");
                // Dimensions connues pour l'affiche générée : WhatsApp et Facebook construisent
                // la carte d'aperçu sans attendre la fin du téléchargement de l'image.
                if (posterImage)
                    html.Append("<meta property=\"og:image:type\" content=\"image/png\"><meta property=\"og:image:width\" content=\"1200\"><meta property=\"og:image:height\" content=\"630\">");
            }
            html.Append($"<meta name=\"twitter:card\" content=\"summary_large_image\"><meta name=\"twitter:title\" content=\"{E(title)}\"><meta name=\"twitter:description\" content=\"{E(description)}\">");
            html.Append($"<meta http-equiv=\"refresh\" content=\"0;url={E(target)}\">");
            html.Append("</head><body style=\"font-family:system-ui,sans-serif;text-align:center;padding:3rem 1rem\">");
            html.Append($"<p>{E(title)}</p><p><a href=\"{E(target)}\">Ouvrir le site de l'événement</a></p>");
            html.Append("</body></html>");
            return html.ToString();
        }
    }
}
