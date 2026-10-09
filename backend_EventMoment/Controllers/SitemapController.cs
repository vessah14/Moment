using System.Text;
using System.Xml;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    // Sitemap des sites d'événements, référencé par le robots.txt du frontend (les moteurs
    // acceptent un sitemap hébergé sur un autre domaine s'il est déclaré dans le
    // robots.txt du site dont il liste les pages). Les URL pointent vers le frontend.
    [ApiController]
    public class SitemapController : ControllerBase
    {
        // Limite du protocole sitemaps.org pour un seul fichier.
        private const int MaxUrls = 50000;

        private readonly IPublicSiteService _service;
        private readonly IConfiguration _config;

        public SitemapController(IPublicSiteService service, IConfiguration config)
        {
            _service = service;
            _config = config;
        }

        [HttpGet("sitemap-events.xml")]
        [AllowAnonymous]
        [ResponseCache(Duration = 3600)]
        public async Task<IActionResult> Events()
        {
            var baseUrl = (_config["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
            var sites = await _service.GetSearchableSitesAsync(MaxUrls);

            var settings = new XmlWriterSettings { Encoding = new UTF8Encoding(false), Indent = true, Async = true };
            await using var stream = new MemoryStream();
            await using (var writer = XmlWriter.Create(stream, settings))
            {
                await writer.WriteStartDocumentAsync();
                await writer.WriteStartElementAsync(null, "urlset", "http://www.sitemaps.org/schemas/sitemap/0.9");
                foreach (var (slug, lastModified) in sites)
                {
                    await writer.WriteStartElementAsync(null, "url", null);
                    // XmlWriter échappe le contenu ; le slug est en plus encodé pour l'URL.
                    await writer.WriteElementStringAsync(null, "loc", null, $"{baseUrl}/e/{Uri.EscapeDataString(slug)}");
                    await writer.WriteElementStringAsync(null, "lastmod", null, lastModified.UtcDateTime.ToString("yyyy-MM-dd"));
                    await writer.WriteElementStringAsync(null, "changefreq", null, "weekly");
                    await writer.WriteEndElementAsync();
                }
                await writer.WriteEndElementAsync();
                await writer.WriteEndDocumentAsync();
            }

            return File(stream.ToArray(), "application/xml; charset=utf-8");
        }
    }
}
