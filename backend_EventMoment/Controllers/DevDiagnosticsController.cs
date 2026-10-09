using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend_EventMoment.Controllers
{
    // Diagnostic de configuration, UNIQUEMENT en développement (404 ailleurs) : indique
    // d'où vient la clé Brevo réellement chargée (secrets, variable d'environnement…) et
    // son empreinte SHA-256 tronquée, sans jamais renvoyer la clé elle-même.
    [ApiController]
    [AllowAnonymous]
    public class DevDiagnosticsController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _env;

        public DevDiagnosticsController(IConfiguration config, IWebHostEnvironment env)
        {
            _config = config;
            _env = env;
        }

        [HttpGet("api/dev/email-config")]
        public IActionResult EmailConfig()
        {
            if (!_env.IsDevelopment()) return NotFound();

            var key = _config["Brevo:ApiKey"] ?? string.Empty;
            var sender = _config["Brevo:SenderEmail"] ?? string.Empty;

            // Le dernier fournisseur qui définit la clé est celui qui gagne.
            string? source = null;
            if (_config is IConfigurationRoot root)
            {
                foreach (var provider in root.Providers.Reverse())
                {
                    if (provider.TryGet("Brevo:ApiKey", out _))
                    {
                        source = provider.ToString();
                        break;
                    }
                }
            }

            return Ok(new
            {
                environment = _env.EnvironmentName,
                keySource = source ?? "(aucune)",
                keyLength = key.Length,
                keyLooksLikeApiKey = key.StartsWith("xkeysib-", StringComparison.Ordinal),
                keyHasWhitespace = key.Any(char.IsWhiteSpace),
                keyFingerprint = key.Length == 0
                    ? null
                    : Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(key)))[..12],
                senderDomain = sender.Contains('@') ? sender[(sender.IndexOf('@') + 1)..] : null,
                emailProvider = string.IsNullOrWhiteSpace(key) ? "SMTP" : "Brevo",
            });
        }
    }
}
