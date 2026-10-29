using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace backend_EventMoment.Controllers;

// Rapports de la Content-Security-Policy du site (en-tête Report-Only posé par Vercel) :
// chaque ressource que la politique aurait bloquée est journalisée, pour régler la
// politique avant de l'appliquer (OWASP A05 / XSS). Le navigateur envoie ces rapports
// sans authentification ; seuls quelques champs, tronqués, sont gardés.
[ApiController]
[AllowAnonymous]
[Route("api/csp-report")]
public sealed class CspReportController : ControllerBase
{
    private const int MaxBodyLength = 16 * 1024;
    private const int MaxFieldLength = 300;
    private readonly ILogger<CspReportController> _logger;

    public CspReportController(ILogger<CspReportController> logger) => _logger = logger;

    [HttpPost]
    [EnableRateLimiting("public-track")]
    public async Task<IActionResult> Report()
    {
        // Type « application/csp-report » : lu à la main plutôt que par le binding MVC.
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var buffer = new char[MaxBodyLength + 1];
        var length = await reader.ReadBlockAsync(buffer, 0, buffer.Length);
        if (length == 0 || length > MaxBodyLength) return NoContent();

        try
        {
            using var document = JsonDocument.Parse(new string(buffer, 0, length));
            var root = document.RootElement;
            var report = root.ValueKind == JsonValueKind.Object && root.TryGetProperty("csp-report", out var inner)
                ? inner
                : root;
            if (report.ValueKind != JsonValueKind.Object) return NoContent();

            _logger.LogWarning(
                "CSP : {Directive} aurait bloqué {BlockedUri} sur {DocumentUri} ({Source}:{Line})",
                Field(report, "effective-directive") ?? Field(report, "violated-directive"),
                Field(report, "blocked-uri"),
                Field(report, "document-uri"),
                Field(report, "source-file"),
                Field(report, "line-number"));
        }
        catch (JsonException)
        {
            // Rapport illisible : ignoré.
        }
        return NoContent();
    }

    private static string? Field(JsonElement report, string name)
    {
        if (!report.TryGetProperty(name, out var value)) return null;
        var text = value.ValueKind == JsonValueKind.String ? value.GetString() : value.GetRawText();
        if (string.IsNullOrEmpty(text)) return null;
        text = text.ReplaceLineEndings(" ");
        return text.Length > MaxFieldLength ? text[..MaxFieldLength] : text;
    }
}
