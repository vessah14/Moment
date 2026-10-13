using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using backend_EventMoment.Services.Email;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class TicketingService : ITicketingService
    {
        private readonly AdminDbContext _context;
        private readonly IEmailSender? _emailSender;
        private readonly IConfiguration? _config;
        private readonly IPlanService? _plans;

        public TicketingService(AdminDbContext context, IEmailSender? emailSender = null, IConfiguration? config = null,
            IPlanService? plans = null)
        {
            _context = context;
            _plans = plans;
            _emailSender = emailSender;
            _config = config;
        }

        public async Task<TicketTypeDto> CreateTypeAsync(CreateTicketTypeDto dto, Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entity = new TicketType
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                Name = dto.Name,
                PriceCents = dto.PriceCents,
                Quota = dto.Quota,
                SoldCount = 0,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.TicketTypes.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<List<TicketTypeDto>> GetTypesAsync(Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entities = await _context.TicketTypes
                .Where(t => t.EventId == eventId)
                .OrderBy(t => t.CreatedAt)
                .ToListAsync();
            return entities.Select(Map).ToList();
        }

        public async Task<bool> DeleteTypeAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.TicketTypes.FirstOrDefaultAsync(t => t.Id == id && t.Event.OrganizerId == organizerId);
            if (entity == null)
                return false;

            _context.TicketTypes.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<TicketSaleDto> RecordSaleAsync(Guid ticketTypeId, RecordTicketSaleDto dto, Guid organizerId)
        {
            var ticketType = await _context.TicketTypes
                .FirstOrDefaultAsync(t => t.Id == ticketTypeId && t.Event.OrganizerId == organizerId);
            if (ticketType == null)
                throw new KeyNotFoundException("Type de billet introuvable.");

            // Incrément conditionnel atomique (UPDATE ... WHERE sold_count < quota) dans la même
            // transaction que la vente : deux ventes simultanées ne peuvent plus dépasser le quota.
            await using var transaction = await _context.Database.BeginTransactionAsync();
            var reserved = await _context.TicketTypes
                .Where(t => t.Id == ticketType.Id && t.SoldCount < t.Quota)
                .ExecuteUpdateAsync(s => s.SetProperty(t => t.SoldCount, t => t.SoldCount + 1));
            if (reserved == 0)
                throw new InvalidOperationException("Quota atteint pour ce type de billet.");

            var sale = new TicketSale
            {
                Id = Guid.NewGuid(),
                TicketTypeId = ticketType.Id,
                EventId = ticketType.EventId,
                BuyerName = dto.BuyerName,
                BuyerEmail = dto.BuyerEmail,
                Status = TicketSaleStatus.Payee,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.TicketSales.Add(sale);

            // Un acheteur de billet doit apparaître comme un invité normal (check-in, plan de
            // table, livre d'or, campagnes) — sinon l'organisateur se retrouve avec deux listes
            // de personnes qui ne se rejoignent jamais. On évite les doublons si le même acheteur
            // règle plusieurs billets pour le même événement.
            // Acheter un billet vaut confirmation de présence : l'acheteur est "présent" côté
            // RSVP, ce qui lui donne aussi accès à son QR d'entrée sur sa page d'invitation.
            var buyerEmail = dto.BuyerEmail.Trim();
            var guest = await _context.Guests
                .FirstOrDefaultAsync(g => g.EventId == ticketType.EventId && g.Email != null && g.Email.ToLower() == buyerEmail.ToLower());
            if (guest == null)
            {
                // Un acheteur devient un invité : la limite d'invités de l'offre s'applique.
                if (_plans != null)
                    await _plans.EnsureCanAddGuestAsync(organizerId, ticketType.EventId);
                guest = new Guest
                {
                    Id = Guid.NewGuid(),
                    EventId = ticketType.EventId,
                    FullName = dto.BuyerName,
                    Email = buyerEmail,
                    Status = GuestStatus.Present,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };
                _context.Guests.Add(guest);
            }
            else if (guest.Status != GuestStatus.Present)
            {
                guest.Status = GuestStatus.Present;
                guest.UpdatedAt = DateTimeOffset.UtcNow;
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            await SendTicketEmailAsync(ticketType, guest);

            return new TicketSaleDto
            {
                Id = sale.Id,
                TicketTypeId = ticketType.Id,
                TicketTypeName = ticketType.Name,
                BuyerName = sale.BuyerName,
                BuyerEmail = sale.BuyerEmail,
                Status = sale.Status,
                CreatedAt = sale.CreatedAt
            };
        }

        // Sans cet e-mail, l'acheteur n'avait aucune trace de son achat ni de QR pour entrer.
        private async Task SendTicketEmailAsync(TicketType ticketType, Guest guest)
        {
            if (_emailSender == null || string.IsNullOrWhiteSpace(guest.Email))
                return;

            var eventName = await _context.Events.AsNoTracking()
                .Where(e => e.Id == ticketType.EventId)
                .Select(e => e.Name)
                .FirstOrDefaultAsync() ?? string.Empty;
            var baseUrl = _config?["Frontend:BaseUrl"] ?? "http://localhost:5173";
            var link = $"{baseUrl}/invitation/{guest.Id}";

            var html = EmailLayout.Render(new EmailMessage
            {
                Preheader = $"Votre billet {ticketType.Name} pour {eventName} est confirmé.",
                Kicker = "Billet confirmé",
                Title = "Votre place est réservée 🎟️",
                Subtitle = eventName,
                BodyHtml = EmailLayout.P($"Bonjour {EmailLayout.E(guest.FullName)},")
                    + EmailLayout.P($"Votre billet pour <b>{EmailLayout.E(eventName)}</b> est confirmé. "
                        + "Votre QR code d'entrée vous attend : présentez-le à l'accueil le jour de l'événement."),
                Callout = new EmailCallout("🎟️ Votre billet", ticketType.Name, EmailLayout.Lines(("Titulaire :", guest.FullName))),
                ButtonText = "Afficher mon billet et mon QR code",
                ButtonUrl = link,
                NoteHtml = "Ce lien est personnel : ne le partagez pas, il donne accès à votre QR code d'entrée.",
                FooterReason = "Vous recevez cet e-mail suite à votre réservation sur un site d'événement TBF MOMENT.",
            });

            try
            {
                await _emailSender.SendAsync(guest.Email, $"Votre billet — {eventName}", html);
            }
            catch
            {
                // La vente est enregistrée : un échec d'envoi ne doit pas l'annuler.
            }
        }

        public async Task<List<TicketSaleDto>> GetSalesAsync(Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            return await _context.TicketSales
                .Where(s => s.EventId == eventId)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new TicketSaleDto
                {
                    Id = s.Id,
                    TicketTypeId = s.TicketTypeId,
                    TicketTypeName = s.TicketType.Name,
                    BuyerName = s.BuyerName,
                    BuyerEmail = s.BuyerEmail,
                    Status = s.Status,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();
        }

        private static TicketTypeDto Map(TicketType entity) => new()
        {
            Id = entity.Id,
            Name = entity.Name,
            PriceCents = entity.PriceCents,
            Quota = entity.Quota,
            SoldCount = entity.SoldCount
        };
    }
}
