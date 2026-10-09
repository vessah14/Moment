using System.Net;
using backend_EventMoment.Data;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Services.Email;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class OrganizerNotifier : IOrganizerNotifier
    {
        private readonly AdminDbContext _context;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _config;
        private readonly ILogger<OrganizerNotifier> _logger;

        public OrganizerNotifier(AdminDbContext context, IEmailSender emailSender, IConfiguration config, ILogger<OrganizerNotifier> logger)
        {
            _context = context;
            _emailSender = emailSender;
            _config = config;
            _logger = logger;
        }

        public async Task NotifyNewGuestbookEntryAsync(Guid eventId, string authorName)
        {
            var target = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .Where(e => e.Id == eventId)
                .Select(e => new { e.Name, e.OrganizerId, OrganizerEmail = e.Utilisateur.Email, OrganizerName = e.Utilisateur.FullName })
                .FirstOrDefaultAsync();
            if (target == null)
                return;

            var settings = await _context.OrganizerNotificationSettings.AsNoTracking()
                .FirstOrDefaultAsync(s => s.OrganizerId == target.OrganizerId);
            if (settings != null && !settings.Guestbook)
                return;

            var baseUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";
            var html = $"""
                <p>Bonjour {WebUtility.HtmlEncode(target.OrganizerName)},</p>
                <p><strong>{WebUtility.HtmlEncode(authorName)}</strong> a laissé un message dans le livre d'or de « {WebUtility.HtmlEncode(target.Name)} ».</p>
                <p>Il n'apparaîtra sur votre site qu'après votre validation.</p>
                <p><a href="{baseUrl}/dashboard/livre-dor">Modérer le livre d'or</a></p>
                <p style="color:#888;font-size:12px">Vous pouvez désactiver ces notifications dans Paramètres › Notifications.</p>
                """;

            try
            {
                await _emailSender.SendAsync(target.OrganizerEmail, $"Nouveau message dans le livre d'or — {target.Name}", html);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Notification livre d'or non envoyée pour l'événement {EventId}", eventId);
            }
        }

        public async Task NotifyNewRsvpAsync(Guid eventId, string guestName, bool confirmed, int accompanyingCount)
        {
            // Appelé depuis l'endpoint RSVP public (requête anonyme) : les filtres
            // organisateur de AdminDbContext masqueraient tout, d'où IgnoreQueryFilters.
            var target = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .Where(e => e.Id == eventId)
                .Select(e => new { e.Name, e.OrganizerId, OrganizerEmail = e.Utilisateur.Email, OrganizerName = e.Utilisateur.FullName })
                .FirstOrDefaultAsync();
            if (target == null)
                return;

            var settings = await _context.OrganizerNotificationSettings.AsNoTracking()
                .FirstOrDefaultAsync(s => s.OrganizerId == target.OrganizerId);
            if (settings != null && !settings.NewRsvp)
                return;

            var baseUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";
            var answer = confirmed
                ? (accompanyingCount > 0 ? $"a confirmé sa présence (+{accompanyingCount} accompagnant(s))" : "a confirmé sa présence")
                : "a décliné l'invitation";

            var html = $"""
                <p>Bonjour {WebUtility.HtmlEncode(target.OrganizerName)},</p>
                <p><strong>{WebUtility.HtmlEncode(guestName)}</strong> {answer} pour « {WebUtility.HtmlEncode(target.Name)} ».</p>
                <p><a href="{baseUrl}/dashboard/participants">Voir la liste des invités</a></p>
                <p style="color:#888;font-size:12px">Vous pouvez désactiver ces notifications dans Paramètres › Notifications.</p>
                """;

            try
            {
                await _emailSender.SendAsync(target.OrganizerEmail, $"Nouvelle réponse RSVP — {target.Name}", html);
            }
            catch (Exception ex)
            {
                // La réponse de l'invité est déjà enregistrée : un échec d'envoi ne doit pas la faire échouer.
                _logger.LogWarning(ex, "Notification RSVP non envoyée pour l'événement {EventId}", eventId);
            }
        }
    }
}
