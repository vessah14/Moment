using System.Net;
using backend_EventMoment.Data;
using backend_EventMoment.Models;
using backend_EventMoment.Services.Email;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    // Envoie les rappels automatiques activés par les organisateurs (table event_reminders).
    // Chaque rappel part une seule fois, dans sa fenêtre :
    //  - non_respondents : à partir de J-7, aux invités encore "en attente"
    //  - day_before      : la veille, aux invités confirmés
    //  - thank_you       : de J+1 à J+7, aux invités confirmés
    public class ReminderDispatcher : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromMinutes(30);

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<ReminderDispatcher> _logger;

        public ReminderDispatcher(IServiceScopeFactory scopeFactory, ILogger<ReminderDispatcher> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var timer = new PeriodicTimer(Interval);
            do
            {
                try
                {
                    await DispatchDueRemindersAsync(DateOnly.FromDateTime(DateTime.UtcNow), stoppingToken);
                }
                catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogError(ex, "Échec du traitement des rappels automatiques.");
                }
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }

        public static bool IsDue(string kind, DateOnly eventDate, DateOnly today) => kind switch
        {
            EventReminderKind.NonRespondents => today >= eventDate.AddDays(-7) && today < eventDate,
            EventReminderKind.DayBefore => today == eventDate.AddDays(-1),
            EventReminderKind.ThankYou => today >= eventDate.AddDays(1) && today <= eventDate.AddDays(7),
            _ => false
        };

        public async Task DispatchDueRemindersAsync(DateOnly today, CancellationToken ct)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
            var emailSender = scope.ServiceProvider.GetRequiredService<IEmailSender>();
            var baseUrl = scope.ServiceProvider.GetRequiredService<IConfiguration>()["Frontend:BaseUrl"] ?? "http://localhost:5173";

            // Aucun utilisateur connecté ici : les filtres organisateur doivent être ignorés.
            var candidates = await db.EventReminders.IgnoreQueryFilters()
                .Where(r => r.Enabled && r.LastSentAt == null
                    && r.Event.Status == EventStatus.Publie
                    && r.Event.EventDate != null
                    && !db.EventModerations.Any(m => m.EventId == r.EventId))
                .Select(r => new { r.Id, r.Kind, r.EventId, EventName = r.Event.Name, EventDate = r.Event.EventDate!.Value })
                .ToListAsync(ct);

            foreach (var reminder in candidates.Where(c => IsDue(c.Kind, c.EventDate, today)))
            {
                // Réservation atomique avant l'envoi : une seule instance du serveur envoie
                // ce rappel, et un plantage en cours d'envoi ne provoque pas de doublon.
                var claimed = await db.EventReminders.IgnoreQueryFilters()
                    .Where(r => r.Id == reminder.Id && r.LastSentAt == null)
                    .ExecuteUpdateAsync(s => s.SetProperty(r => r.LastSentAt, DateTimeOffset.UtcNow), ct);
                if (claimed == 0)
                    continue;

                var targetStatus = reminder.Kind == EventReminderKind.NonRespondents ? GuestStatus.EnAttente : GuestStatus.Present;
                var guests = await db.Guests.IgnoreQueryFilters().AsNoTracking()
                    .Where(g => g.EventId == reminder.EventId && g.Status == targetStatus && g.Email != null && g.Email != "")
                    .Select(g => new { g.Id, g.FullName, g.Email })
                    .ToListAsync(ct);

                var sent = 0;
                foreach (var guest in guests)
                {
                    var (subject, html) = BuildMessage(reminder.Kind, reminder.EventName, reminder.EventDate, guest.FullName, $"{baseUrl}/invitation/{guest.Id}");
                    try
                    {
                        if (await emailSender.SendAsync(guest.Email!, subject, html))
                            sent++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Rappel {Kind} non envoyé à un invité de l'événement {EventId}", reminder.Kind, reminder.EventId);
                    }
                }

                _logger.LogInformation("Rappel {Kind} de l'événement {EventId} : {Sent}/{Total} e-mail(s) envoyé(s).",
                    reminder.Kind, reminder.EventId, sent, guests.Count);
            }
        }

        private static (string Subject, string Html) BuildMessage(string kind, string eventName, DateOnly eventDate, string guestName, string link)
        {
            var name = WebUtility.HtmlEncode(guestName);
            var evt = WebUtility.HtmlEncode(eventName);
            var date = eventDate.ToDateTime(TimeOnly.MinValue).ToString("d MMMM yyyy", new System.Globalization.CultureInfo("fr-FR"));

            return kind switch
            {
                EventReminderKind.NonRespondents => (
                    $"Répondez à l'invitation — {eventName}",
                    $"""
                    <p>Bonjour {name},</p>
                    <p>Vous êtes invité(e) à « {evt} » le {date}. Nous n'avons pas encore reçu votre réponse.</p>
                    <p><a href="{link}">Répondre à l'invitation</a></p>
                    """),
                EventReminderKind.DayBefore => (
                    $"C'est demain — {eventName}",
                    $"""
                    <p>Bonjour {name},</p>
                    <p>Petit rappel : « {evt} » a lieu demain, le {date}. Nous avons hâte de vous y voir !</p>
                    <p><a href="{link}">Revoir votre invitation</a></p>
                    """),
                _ => (
                    $"Merci d'être venu(e) — {eventName}",
                    $"""
                    <p>Bonjour {name},</p>
                    <p>Merci d'avoir partagé « {evt} » avec nous. Votre présence a compté !</p>
                    """)
            };
        }
    }
}
