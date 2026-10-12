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
            var name = EmailLayout.E(guestName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? guestName);
            var evt = EmailLayout.E(eventName);
            var date = eventDate.ToDateTime(TimeOnly.MinValue).ToString("dddd d MMMM yyyy", new System.Globalization.CultureInfo("fr-FR"));
            const string footer = "Vous recevez ce rappel car vous êtes invité·e à cet événement organisé avec TBF MOMENT.";

            return kind switch
            {
                EventReminderKind.NonRespondents => (
                    $"Répondez à l'invitation — {eventName}",
                    EmailLayout.Render(new EmailMessage
                    {
                        Preheader = $"Nous attendons encore votre réponse pour {eventName}.",
                        Kicker = "Petit rappel",
                        Title = eventName,
                        Subtitle = "Nous n'avons pas encore reçu votre réponse",
                        BodyHtml = EmailLayout.P($"Bonjour {name},")
                            + EmailLayout.P($"Vous êtes invité·e à <b>{evt}</b> le {EmailLayout.E(date)}. "
                                + "Pour aider l'organisateur à tout préparer, dites-nous si vous serez là : cela ne prend qu'un instant."),
                        ButtonText = "Répondre à l'invitation",
                        ButtonUrl = link,
                        FooterReason = footer,
                    })),
                EventReminderKind.DayBefore => (
                    $"C'est demain — {eventName}",
                    EmailLayout.Render(new EmailMessage
                    {
                        Preheader = $"{eventName} a lieu demain : on a hâte de vous voir !",
                        Kicker = "C'est demain",
                        Title = eventName,
                        Subtitle = "On a hâte de vous y voir !",
                        BodyHtml = EmailLayout.P($"Bonjour {name},")
                            + EmailLayout.P($"Petit rappel : <b>{evt}</b> a lieu <b>demain</b>, le {EmailLayout.E(date)}. "
                                + "Retrouvez l'adresse, le programme et votre réponse sur votre invitation."),
                        ButtonText = "Revoir mon invitation",
                        ButtonUrl = link,
                        FooterReason = footer,
                    })),
                _ => (
                    $"Merci d'être venu(e) — {eventName}",
                    EmailLayout.Render(new EmailMessage
                    {
                        Preheader = $"Merci d'avoir partagé {eventName} avec nous.",
                        Kicker = "Merci",
                        Title = "Merci d'être venu·e ! 💜",
                        Subtitle = eventName,
                        BodyHtml = EmailLayout.P($"Bonjour {name},")
                            + EmailLayout.P($"Merci d'avoir partagé <b>{evt}</b> avec nous. Votre présence a compté !"),
                        FooterReason = footer,
                    }))
            };
        }
    }
}
