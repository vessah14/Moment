using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Prometheus;

namespace backend_EventMoment.Controllers
{
    // Core Web Vitals des vrais visiteurs (frontend utils/webVitals.js) : rangés dans des
    // histogrammes Prometheus par type de page et type de réseau. Aucune donnée personnelle :
    // ni adresse de page, ni identifiant. Envoi en text/plain (sendBeacon, sans prévol CORS).
    [ApiController]
    public class VitalsController : ControllerBase
    {
        private const int MaxBodyBytes = 2048;
        private static readonly HashSet<string> Pages = ["accueil", "evenement", "mur", "invitation", "tableau-de-bord", "autre"];
        private static readonly HashSet<string> Networks = ["", "slow-2g", "2g", "3g", "4g"];

        // Secondes pour les durées, sans unité pour le CLS. Seuils « bon » de Google :
        // LCP 2,5 s, INP 0,2 s, CLS 0,1, FCP 1,8 s, TTFB 0,8 s.
        private static readonly Dictionary<string, (Histogram Histogram, double Divisor, double Max)> Metrics = new()
        {
            ["lcp"] = (Create("web_vitals_lcp_seconds", "Largest Contentful Paint", 0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 8, 12, 20), 1000, 120_000),
            ["fcp"] = (Create("web_vitals_fcp_seconds", "First Contentful Paint", 0.5, 1, 1.8, 2.5, 3, 4, 6, 10), 1000, 120_000),
            ["ttfb"] = (Create("web_vitals_ttfb_seconds", "Time To First Byte", 0.1, 0.2, 0.4, 0.8, 1.2, 1.8, 3, 6), 1000, 60_000),
            ["inp"] = (Create("web_vitals_inp_seconds", "Interaction to Next Paint (approx.)", 0.05, 0.1, 0.2, 0.3, 0.5, 1, 2), 1000, 60_000),
            ["cls"] = (Create("web_vitals_cls", "Cumulative Layout Shift", 0.01, 0.05, 0.1, 0.15, 0.25, 0.5, 1), 1, 10),
        };

        private static Histogram Create(string name, string help, params double[] buckets) =>
            Prometheus.Metrics.CreateHistogram(name, help, new HistogramConfiguration { LabelNames = ["page", "net"], Buckets = buckets });

        [HttpPost("api/vitals")]
        [AllowAnonymous]
        [EnableRateLimiting("public-vitals")]
        [Consumes("text/plain", "application/json")]
        [RequestSizeLimit(MaxBodyBytes)]
        public async Task<IActionResult> Record()
        {
            using var reader = new StreamReader(Request.Body);
            var raw = await reader.ReadToEndAsync();
            if (raw.Length > MaxBodyBytes) return BadRequest();
            return RecordPayload(raw) ? NoContent() : BadRequest();
        }

        // Public pour les tests : true si au moins une mesure valide a été enregistrée.
        public static bool RecordPayload(string raw)
        {
            JsonElement root;
            try
            {
                root = JsonDocument.Parse(raw).RootElement;
            }
            catch (JsonException)
            {
                return false;
            }
            if (root.ValueKind != JsonValueKind.Object) return false;
            var page = root.TryGetProperty("page", out var p) && p.ValueKind == JsonValueKind.String ? p.GetString()! : "";
            var net = root.TryGetProperty("net", out var n) && n.ValueKind == JsonValueKind.String ? n.GetString()! : "";
            if (!Pages.Contains(page)) return false;
            if (!Networks.Contains(net)) net = "";

            var recorded = false;
            foreach (var (key, (histogram, divisor, max)) in Metrics)
            {
                if (!root.TryGetProperty(key, out var v) || v.ValueKind != JsonValueKind.Number || !v.TryGetDouble(out var value)) continue;
                if (double.IsNaN(value) || value < 0 || value > max) continue;
                histogram.WithLabels(page, net == "" ? "inconnu" : net).Observe(value / divisor);
                recorded = true;
            }
            return recorded;
        }
    }
}
