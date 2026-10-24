using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using backend_EventMoment.Services.Email;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class CampaignService : ICampaignService
    {
        private readonly AdminDbContext _context;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _config;
        private readonly ILogger<CampaignService> _logger;

        public CampaignService(AdminDbContext context, IEmailSender emailSender, IConfiguration config, ILogger<CampaignService> logger)
        {
            _context = context;
            _emailSender = emailSender;
            _config = config;
            _logger = logger;
        }

        private IQueryable<Guest> FilterByAudience(IQueryable<Guest> query, string audience) => audience switch
        {
            "Confirmés" => query.Where(g => g.Status == GuestStatus.Present),
            "Refus" => query.Where(g => g.Status == GuestStatus.Absent),
            "Non répondus" or "En attente" => query.Where(g => g.Status == GuestStatus.EnAttente),
            _ => query
        };

        private async Task<int> CountRecipientsAsync(Guid eventId, string audience)
        {
            var query = FilterByAudience(_context.Guests.Where(g => g.EventId == eventId), audience);
            return await query.CountAsync();
        }

        private async Task<EmailSendResult> SendInvitationEmailsAsync(Event evt, string audience, string template, string subject)
        {
            var guests = await FilterByAudience(_context.Guests.Where(g => g.EventId == evt.Id), audience)
                .AsNoTracking()
                .ToListAsync();
            var organizer = await _context.Organizers.AsNoTracking()
                .Where(user => user.Id == evt.OrganizerId)
                .Select(user => new { user.Email, user.FullName })
                .FirstOrDefaultAsync();

            var location = await _context.EventLocations.AsNoTracking()
                .Where(l => l.EventId == evt.Id)
                .OrderBy(l => l.Position)
                .FirstOrDefaultAsync();

            var baseUrl = (_config["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
            var dateLabel = evt.EventDate.HasValue
                ? evt.EventDate.Value.ToDateTime(TimeOnly.MinValue).ToString("d MMMM yyyy", new System.Globalization.CultureInfo("fr-FR"))
                : "";
            var lieuLabel = System.Net.WebUtility.HtmlEncode(location?.Address ?? location?.Label ?? "");

            var sentCount = 0;
            string? firstFailure = null;
            var recipients = guests.Where(g => !string.IsNullOrWhiteSpace(g.Email)).ToList();

            // Envois en parallèle borné : un envoi séquentiel sur une longue liste
            // d'invités dépasserait le délai de la requête HTTP côté organisateur.
            await Parallel.ForEachAsync(recipients, new ParallelOptions { MaxDegreeOfParallelism = 5 }, async (guest, ct) =>
            {
                var nameParts = guest.FullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                var prenom = System.Net.WebUtility.HtmlEncode(nameParts.Length > 0 ? nameParts[0] : guest.FullName);
                var nom = System.Net.WebUtility.HtmlEncode(nameParts.Length > 1 ? nameParts[1].Trim() : "");
                var lien = $"{baseUrl.TrimEnd('/')}/e/{Uri.EscapeDataString(evt.Slug)}?invite={guest.Id}";

                var message = RenderTemplate(template, new Dictionary<string, string>
                {
                    ["{prénom}"] = prenom,
                    ["{nom}"] = nom,
                    ["{date}"] = dateLabel,
                    ["{lieu}"] = lieuLabel,
                    ["{lien}"] = $"<a href=\"{lien}\" style=\"color:#6C4BF4;\">{lien}</a>",
                });
                var html = EmailLayout.Render(new EmailMessage
                {
                    Preheader = subject,
                    Kicker = "Message de l'organisateur",
                    Title = evt.Name,
                    Subtitle = organizer?.FullName is { Length: > 0 } orgName ? $"De la part de {orgName}" : null,
                    BodyHtml = EmailLayout.P(message),
                    ButtonText = "Voir mon invitation",
                    ButtonUrl = lien,
                    SignatureHtml = organizer?.FullName is { Length: > 0 } signName
                        ? $"À très bientôt,<br><b>{EmailLayout.E(signName)}</b>"
                        : null,
                    FooterReason = "Vous recevez ce message car vous êtes invité·e à cet événement organisé avec TBF MOMENT. "
                        + "Pour répondre à l'organisateur, répondez simplement à cet e-mail.",
                });

                try
                {
                    var delivered = _emailSender is IOrganizerEmailSender organizerSender && organizer is not null
                        ? await organizerSender.SendForOrganizerAsync(guest.Email!, subject, html, organizer.Email, organizer.FullName)
                        : await _emailSender.SendAsync(guest.Email!, subject, html);
                    if (delivered)
                        Interlocked.Increment(ref sentCount);
                    else
                        Interlocked.CompareExchange(ref firstFailure, "Le fournisseur d’e-mail n’a pas confirmé l’envoi. Vérifiez sa configuration.", null);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Campaign email delivery failed for event {EventId}.", evt.Id);
                    Interlocked.CompareExchange(ref firstFailure, DescribeEmailDeliveryFailure(ex), null);
                    // Un échec d'envoi individuel ne doit pas interrompre le reste de la campagne.
                }
            });

            return new EmailSendResult(sentCount, firstFailure);
        }

        private static string DescribeEmailDeliveryFailure(Exception exception)
        {
            var hint = DescribeEmailDeliveryHint(exception);
            // La raison exacte donnée par Brevo (ex. « Key not found », « unrecognised IP
            // address ») : indispensable pour corriger, et sans donnée sensible.
            if (exception is Services.Email.BrevoApiException { BrevoMessage: { Length: > 0 } brevoMessage })
            {
                var reason = brevoMessage.Length > 200 ? brevoMessage[..200] + "…" : brevoMessage;
                return $"{hint} Réponse de Brevo : « {reason} ».";
            }
            return hint;
        }

        private static string DescribeEmailDeliveryHint(Exception exception)
        {
            if (exception is HttpRequestException { StatusCode: { } statusCode })
            {
                var status = (int)statusCode;
                return statusCode switch
                {
                    System.Net.HttpStatusCode.Unauthorized or System.Net.HttpStatusCode.Forbidden =>
                        $"Brevo refuse l’accès (HTTP {status}). Vérifiez que la nouvelle clé API est enregistrée et que l’API a été redémarrée.",
                    System.Net.HttpStatusCode.BadRequest =>
                        "Brevo refuse l’expéditeur ou le destinataire (HTTP 400). Vérifiez que l’adresse Brevo:SenderEmail est validée et que l’e-mail de l’invité est correct.",
                    System.Net.HttpStatusCode.TooManyRequests =>
                        "Brevo applique une limite d’envoi (HTTP 429). Réessayez plus tard et vérifiez votre offre.",
                    _ => $"Brevo a refusé l’envoi (HTTP {status}). Consultez le journal transactionnel Brevo pour le détail."
                };
            }

            if (exception is InvalidOperationException)
                return exception.Message;

            return "Le service d’envoi est inaccessible ou mal configuré. Consultez les journaux du backend.";
        }

        private sealed record EmailSendResult(int SentCount, string? FailureReason);

        private static readonly System.Text.RegularExpressions.Regex PlaceholderPattern =
            new(@"(\{prénom\}|\{nom\}|\{date\}|\{lieu\}|\{lien\})");

        // Le texte saisi par l'organisateur est du texte brut : il est encodé en HTML pour
        // qu'il ne puisse pas injecter de balises (faux formulaires, liens déguisés, pixels
        // de suivi) dans des e-mails envoyés au nom de TBF Moment. Seules les variables
        // connues sont remplacées par leur valeur (déjà encodée).
        private static string RenderTemplate(string template, IReadOnlyDictionary<string, string> values)
        {
            var parts = PlaceholderPattern.Split(template);
            var sb = new System.Text.StringBuilder();
            foreach (var part in parts)
                sb.Append(values.TryGetValue(part, out var value) ? value : System.Net.WebUtility.HtmlEncode(part));
            return sb.ToString().Replace("\r\n", "\n").Replace("\n", "<br/>");
        }

        public async Task<CampaignDto> CreateAsync(CreateCampaignDto dto, Guid eventId, Guid organizerId)
        {
            var evt = await _context.Events.FirstOrDefaultAsync(e => e.Id == eventId && e.OrganizerId == organizerId);
            if (evt == null)
                throw new KeyNotFoundException("Événement introuvable.");

            if (dto.SendNow && dto.Channel == "E-mail")
            {
                var since = DateTimeOffset.UtcNow.AddMinutes(-5);
                var duplicate = await _context.MessageCampaigns.AnyAsync(c => c.EventId == eventId
                    && c.Status == CampaignStatus.Envoyee && c.SentAt != null && c.SentAt > since
                    && c.Subject == dto.Name && c.Body == dto.Body);
                if (duplicate)
                    throw new InvalidOperationException("Cette campagne vient déjà d'être envoyée. Patientez quelques minutes avant de la renvoyer.");
            }

            var recipientCount = await CountRecipientsAsync(eventId, dto.Audience);
            var now = DateTimeOffset.UtcNow;

            var entity = new MessageCampaign
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                Channel = dto.Channel,
                Subject = dto.Name,
                Body = dto.Body,
                Audience = dto.Audience,
                Status = CampaignStatus.Brouillon,
                RecipientCount = recipientCount,
                CreatedAt = now,
                SentAt = null
            };

            _context.MessageCampaigns.Add(entity);
            await _context.SaveChangesAsync();

            var emailResult = new EmailSendResult(0, null);
            if (dto.SendNow && dto.Channel == "E-mail")
                emailResult = await SendInvitationEmailsAsync(evt, dto.Audience, dto.Body, dto.Name);

            if (dto.SendNow && dto.Channel == "E-mail" && emailResult.SentCount > 0)
            {
                entity.Status = CampaignStatus.Envoyee;
                entity.SentAt = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync();
            }

            var result = Map(entity);
            result.EmailsSentCount = emailResult.SentCount;
            result.DeliveryError = emailResult.FailureReason;
            return result;
        }

        public async Task<List<CampaignDto>> GetAllAsync(Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entities = await _context.MessageCampaigns
                .Where(c => c.EventId == eventId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
            return entities.Select(Map).ToList();
        }

        // Une campagne envoyée ne se modifie plus (les e-mails sont partis) ; un brouillon
        // ou une campagne programmée peut l'être, et partir aussitôt avec SendNow.
        public async Task<CampaignDto> UpdateAsync(Guid id, UpdateCampaignDto dto, Guid organizerId)
        {
            var entity = await _context.MessageCampaigns
                .FirstOrDefaultAsync(c => c.Id == id && c.Event.OrganizerId == organizerId)
                ?? throw new KeyNotFoundException("Campagne introuvable.");
            if (entity.Status == CampaignStatus.Envoyee)
                throw new InvalidOperationException("Cette campagne a déjà été envoyée : elle ne peut plus être modifiée. Dupliquez-la pour en créer une nouvelle.");

            var evt = await _context.Events.FirstAsync(e => e.Id == entity.EventId);
            entity.Subject = dto.Name;
            entity.Audience = dto.Audience;
            entity.Body = dto.Body;
            entity.RecipientCount = await CountRecipientsAsync(entity.EventId, dto.Audience);
            await _context.SaveChangesAsync();

            var emailResult = new EmailSendResult(0, null);
            if (dto.SendNow && entity.Channel == "E-mail")
            {
                emailResult = await SendInvitationEmailsAsync(evt, dto.Audience, dto.Body, dto.Name);
                if (emailResult.SentCount > 0)
                {
                    entity.Status = CampaignStatus.Envoyee;
                    entity.SentAt = DateTimeOffset.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }

            var result = Map(entity);
            result.EmailsSentCount = emailResult.SentCount;
            result.DeliveryError = emailResult.FailureReason;
            return result;
        }

        public async Task<bool> DeleteAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.MessageCampaigns.FirstOrDefaultAsync(c => c.Id == id && c.Event.OrganizerId == organizerId);
            if (entity == null) return false;

            _context.MessageCampaigns.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static CampaignDto Map(MessageCampaign entity) => new()
        {
            Id = entity.Id,
            Name = entity.Subject ?? string.Empty,
            Channel = entity.Channel,
            Audience = entity.Audience,
            Body = entity.Body,
            Status = entity.Status,
            RecipientCount = entity.RecipientCount,
            CreatedAt = entity.CreatedAt,
            SentAt = entity.SentAt
        };
    }
}
