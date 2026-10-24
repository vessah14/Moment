using System.Globalization;
using backend_EventMoment.Data;
using backend_EventMoment.Models;
using backend_EventMoment.Services.Email;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    // Réveille InvitationDispatcher dès qu'une invitation est mise en file (ajout d'un
    // invité, publication d'un événement, renvoi), sans attendre le prochain passage.
    public sealed class InvitationSignal
    {
        private readonly SemaphoreSlim _signal = new(0, 1);

        public void Notify()
        {
            if (_signal.CurrentCount == 0)
            {
                try { _signal.Release(); } catch (SemaphoreFullException) { /* déjà signalé */ }
            }
        }

        public Task<bool> WaitAsync(TimeSpan timeout, CancellationToken ct) => _signal.WaitAsync(timeout, ct);
    }

    // Envoie le lien d'invitation (confirmation de présence) aux invités en file :
    // seulement pour un événement publié, non suspendu et pas encore passé (le lien mène
    // à une page qui n'existe pas avant la publication). Trois essais au plus par invité,
    // espacés, puis l'organisateur peut renvoyer depuis la liste des invités.
    public class InvitationDispatcher : BackgroundService
    {
        public const int MaxAttempts = 3;
        private static readonly TimeSpan IdleDelay = TimeSpan.FromMinutes(1);
        private const int BatchSize = 50;

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly InvitationSignal _signal;
        private readonly ILogger<InvitationDispatcher> _logger;

        public InvitationDispatcher(IServiceScopeFactory scopeFactory, InvitationSignal signal, ILogger<InvitationDispatcher> logger)
        {
            _scopeFactory = scopeFactory;
            _signal = signal;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Tant qu'il reste des invitations prêtes, on enchaîne les lots.
                    while (await DispatchPendingAsync(stoppingToken) == BatchSize) { }
                }
                catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogError(ex, "Échec de l'envoi des invitations.");
                }
                try
                {
                    await _signal.WaitAsync(IdleDelay, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    return;
                }
            }
        }

        // Envoie un lot d'invitations prêtes ; renvoie le nombre traité.
        public async Task<int> DispatchPendingAsync(CancellationToken ct)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
            var emailSender = scope.ServiceProvider.GetRequiredService<IEmailSender>();
            var baseUrl = (scope.ServiceProvider.GetRequiredService<IConfiguration>()["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
            var now = DateTimeOffset.UtcNow;
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Aucun utilisateur connecté ici : les filtres organisateur doivent être ignorés.
            var pending = await (
                from inv in db.GuestInvitations
                join g in db.Guests.IgnoreQueryFilters() on inv.GuestId equals g.Id
                join e in db.Events.IgnoreQueryFilters() on inv.EventId equals e.Id
                join o in db.Organizers.IgnoreQueryFilters() on e.OrganizerId equals o.Id
                where inv.SentAt == null && inv.Attempts < MaxAttempts && inv.QueuedAt <= now
                    && g.Email != null && g.Email != ""
                    && e.Status == EventStatus.Publie
                    && (e.EventDate == null || e.EventDate >= today)
                    && !db.EventModerations.Any(m => m.EventId == e.Id)
                orderby inv.QueuedAt
                select new
                {
                    inv.GuestId,
                    inv.Attempts,
                    GuestName = g.FullName,
                    GuestEmail = g.Email!,
                    EventId = e.Id,
                    EventName = e.Name,
                    EventSlug = e.Slug,
                    e.EventDate,
                    e.StartTime,
                    OrganizerName = o.FullName,
                    OrganizerEmail = o.Email,
                })
                .Take(BatchSize)
                .ToListAsync(ct);

            foreach (var item in pending)
            {
                // Réservation atomique : une seule instance du serveur envoie cette invitation.
                var claimed = await db.GuestInvitations
                    .Where(i => i.GuestId == item.GuestId && i.SentAt == null && i.Attempts == item.Attempts)
                    .ExecuteUpdateAsync(s => s.SetProperty(i => i.Attempts, i => (short)(i.Attempts + 1)), ct);
                if (claimed == 0)
                    continue;

                var location = await db.EventLocations.IgnoreQueryFilters().AsNoTracking()
                    .Where(l => l.EventId == item.EventId)
                    .OrderBy(l => l.Position)
                    .Select(l => l.Address ?? l.Label)
                    .FirstOrDefaultAsync(ct);

                var (subject, html) = BuildMessage(item.GuestName, item.EventName, item.EventDate, item.StartTime, location,
                    item.OrganizerName, $"{baseUrl}/e/{Uri.EscapeDataString(item.EventSlug)}?invite={item.GuestId}");
                string? error = null;
                try
                {
                    var delivered = emailSender is IOrganizerEmailSender organizerSender
                        ? await organizerSender.SendForOrganizerAsync(item.GuestEmail, subject, html, item.OrganizerEmail, item.OrganizerName)
                        : await emailSender.SendAsync(item.GuestEmail, subject, html);
                    if (!delivered)
                        error = "Le service d'e-mail n'est pas configuré.";
                }
                catch (Exception ex)
                {
                    // Message court, sans en-têtes ni clé : il est affiché à l'organisateur.
                    error = ex is BrevoApiException brevo && !string.IsNullOrWhiteSpace(brevo.BrevoMessage)
                        ? $"Refus du service d'e-mail : {brevo.BrevoMessage}"
                        : "Le service d'e-mail est indisponible.";
                    _logger.LogWarning(ex, "Invitation non envoyée à un invité de l'événement {EventId}", item.EventId);
                }

                var attempt = item.Attempts + 1;
                if (error == null)
                {
                    await db.GuestInvitations.Where(i => i.GuestId == item.GuestId)
                        .ExecuteUpdateAsync(s => s
                            .SetProperty(i => i.SentAt, DateTimeOffset.UtcNow)
                            .SetProperty(i => i.LastError, (string?)null), ct);
                }
                else
                {
                    // Nouvel essai plus tard (10 min, puis 20…), jusqu'à MaxAttempts.
                    var retryAt = DateTimeOffset.UtcNow.AddMinutes(10 * attempt);
                    var message = error.Length > 300 ? error[..300] : error;
                    await db.GuestInvitations.Where(i => i.GuestId == item.GuestId)
                        .ExecuteUpdateAsync(s => s
                            .SetProperty(i => i.LastError, message)
                            .SetProperty(i => i.QueuedAt, retryAt), ct);
                }
            }
            return pending.Count;
        }

        public static (string Subject, string Html) BuildMessage(string guestName, string eventName, DateOnly? date, TimeOnly? time,
            string? location, string organizerName, string link)
        {
            // Seuls les caractères spéciaux HTML sont encodés : les accents restent lisibles.
            static string E(string value) =>
                value.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace("\"", "&quot;").Replace("'", "&#39;");
            var firstName = guestName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? guestName;
            var fr = CultureInfo.GetCultureInfo("fr-FR");
            var when = date is DateOnly d
                ? char.ToUpper(d.ToString("dddd d MMMM yyyy", fr)[0], fr) + d.ToString("dddd d MMMM yyyy", fr)[1..]
                    + (time is TimeOnly t ? $" à {t:HH\\hmm}" : "")
                : null;

            var details = EmailLayout.Lines(("Quand :", when), ("Où :", location));

            var html = EmailLayout.Render(new EmailMessage
            {
                Preheader = $"{organizerName} vous invite à {eventName}. Confirmez votre présence en un clic.",
                Kicker = "Vous êtes invité·e",
                Title = eventName,
                Subtitle = $"Une invitation de {organizerName}",
                BodyHtml = EmailLayout.P($"Bonjour {E(firstName)},")
                    + EmailLayout.P($"{E(organizerName)} a le plaisir de vous inviter à <b>{E(eventName)}</b>. "
                        + "Merci de confirmer votre présence en un clic."),
                Callout = details.Length == 0 ? null : new EmailCallout("📅 Le rendez-vous", eventName, details),
                ButtonText = "Confirmer ma présence",
                ButtonUrl = link,
                NoteHtml = "Ce lien vous est personnel : il permet aussi de modifier votre réponse plus tard.<br>"
                    + $"Si le bouton ne fonctionne pas : <a href=\"{E(link)}\" style=\"color:#6C4BF4;\">{E(link)}</a>",
                SignatureHtml = $"Au plaisir de vous voir,<br><b>{E(organizerName)}</b>",
                FooterReason = $"Vous recevez cette invitation de la part de {organizerName} via TBF MOMENT. "
                    + "Pour lui répondre, répondez simplement à cet e-mail.",
            });
            return ($"Invitation : {eventName}", html);
        }
    }
}
