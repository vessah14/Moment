using backend_EventMoment.Data;
using backend_EventMoment.Models;
using backend_EventMoment.Services.Email;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public interface IPageReportService
    {
        // false si la page n'existe pas (ou n'est pas publiée) ; une exception ArgumentException
        // si le motif est inconnu.
        Task<bool> ReportAsync(string slug, string? reason, string? message, string? contact);
    }

    // « Signaler cette page » : un visiteur alerte l'équipe TBF MOMENT (jamais l'organisateur)
    // d'un faux événement, d'un faux avis de décès, d'une photo publiée sans accord… Le
    // signalement part par e-mail aux administrateurs et reste dans les journaux ; la page se
    // retire depuis la console admin (Modération).
    public class PageReportService : IPageReportService
    {
        public static readonly IReadOnlyDictionary<string, string> Reasons = new Dictionary<string, string>
        {
            ["arnaque"] = "Faux événement, arnaque ou faux billets",
            ["deces"] = "Faux avis de décès ou fausse annonce sur une personne vivante",
            ["image"] = "Photo ou données publiées sans accord",
            ["choquant"] = "Contenu choquant, haineux ou humiliant",
            ["usurpation"] = "Usurpation d'une personne, d'une famille ou d'une structure",
            ["autre"] = "Autre problème",
        };

        public const int MaxMessage = 600;
        public const int MaxContact = 80;

        private readonly AdminDbContext _context;
        private readonly IEmailSender? _email;
        private readonly IConfiguration? _config;
        private readonly ILogger<PageReportService>? _logger;

        public PageReportService(AdminDbContext context, IEmailSender? email = null, IConfiguration? config = null, ILogger<PageReportService>? logger = null)
        {
            _context = context;
            _email = email;
            _config = config;
            _logger = logger;
        }

        public async Task<bool> ReportAsync(string slug, string? reason, string? message, string? contact)
        {
            if (reason == null || !Reasons.TryGetValue(reason, out var reasonLabel))
                throw new ArgumentException("Choisissez un motif.");

            var eventEntity = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .Where(e => e.Slug == slug && e.Status == EventStatus.Publie)
                .Select(e => new { e.Id, e.Name, e.Slug })
                .FirstOrDefaultAsync();
            if (eventEntity == null) return false;

            var text = Clip(message, MaxMessage);
            var from = OneLine(Clip(contact, MaxContact));
            _logger?.LogWarning("Signalement de la page {Slug} ({EventId}) : {Reason}. Contact : {Contact}. Message : {Message}",
                eventEntity.Slug, eventEntity.Id, reason, string.IsNullOrEmpty(from) ? "-" : from, string.IsNullOrEmpty(text) ? "-" : text);

            var adminEmails = AdminNotificationRecipients.Get(_config);
            if (_email == null || adminEmails.Count == 0) return true;

            var siteUrl = $"{(_config?["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/')}/e/{eventEntity.Slug}";
            var adminUrl = _config?["Frontend:AdminUrl"];
            var subject = OneLine($"Signalement · {Clip(eventEntity.Name, 80)} · {reasonLabel}");
            var html = EmailLayout.Render(new EmailMessage
            {
                Preheader = $"Une page a été signalée : {reasonLabel}.",
                Kicker = "Signalement",
                Title = "Une page a été signalée",
                Subtitle = reasonLabel,
                BodyHtml = EmailLayout.P("Un visiteur a signalé cette page d'événement. Examinez-la sous 48 h et retirez-la "
                        + "si elle enfreint les conditions d'utilisation.")
                    + (string.IsNullOrEmpty(text) ? "" : EmailLayout.P($"« {EmailLayout.E(text)} »")),
                Callout = new EmailCallout("Page signalée", eventEntity.Name,
                    EmailLayout.Lines(("Adresse :", siteUrl), ("Contact du visiteur :", string.IsNullOrEmpty(from) ? "non indiqué" : from))),
                ButtonText = string.IsNullOrWhiteSpace(adminUrl) ? "Voir la page" : "Ouvrir la modération",
                ButtonUrl = string.IsNullOrWhiteSpace(adminUrl) ? siteUrl : $"{adminUrl.TrimEnd('/')}/admin/moderation",
                SignatureHtml = "<b>TBF MOMENT</b> · notification automatique",
                FooterReason = "Vous recevez cet e-mail en tant qu'administrateur de TBF MOMENT.",
            });
            foreach (var adminEmail in adminEmails)
            {
                try
                {
                    await _email.SendAsync(adminEmail, subject, html);
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Signalement non envoyé à {To}", adminEmail);
                }
            }
            return true;
        }

        private static string Clip(string? value, int max)
        {
            var s = (value ?? "").Trim();
            return s.Length > max ? s[..max] : s;
        }

        // Objet d'e-mail et contact : sur une seule ligne.
        private static string OneLine(string value) =>
            string.Join(' ', value.Split(new[] { '\r', '\n', '\t' }, StringSplitOptions.RemoveEmptyEntries)).Trim();
    }
}
