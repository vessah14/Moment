using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class GuestBookService : IGuestBookService
    {
        private readonly AdminDbContext _context;
        private readonly IOrganizerNotifier? _notifier;

        public GuestBookService(AdminDbContext context, IOrganizerNotifier? notifier = null)
        {
            _context = context;
            _notifier = notifier;
        }

        public async Task<bool> CreatePublicAsync(string slug, CreateGuestBookEntryDto dto)
        {
            // Requête anonyme : les filtres organisateur sont ignorés, et on n'accepte que les
            // événements publiés, non suspendus, dont le site affiche bien un livre d'or.
            var eventEntity = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(e => e.Slug == slug && e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id));
            if (eventEntity == null)
                return false;

            var guestBook = await _context.EventBlocks.IgnoreQueryFilters().AsNoTracking()
                .Where(b => b.EventId == eventEntity.Id && b.IsVisible && b.BlockType == "Livre d'or")
                .Select(b => new { b.Content })
                .FirstOrDefaultAsync();
            if (guestBook == null)
                return false;

            var message = dto.Message.Trim();
            // En attente par défaut : rien n'est publié sans validation de l'organisateur, sauf
            // s'il a activé la validation automatique, et seulement pour un message sans alerte.
            var autoApproved = WishAlerts.AutoApprove(guestBook.Content) && WishAlerts.Detect(message) == null;
            _context.GuestBookEntries.Add(new GuestBookEntry
            {
                Id = Guid.NewGuid(),
                EventId = eventEntity.Id,
                AuthorName = dto.AuthorName.Trim(),
                Message = message,
                Service = await ServiceOfAsync(eventEntity.Id, dto.Service),
                Status = autoApproved ? GuestBookStatus.Publie : GuestBookStatus.EnAttente,
                CreatedAt = DateTimeOffset.UtcNow
            });
            await _context.SaveChangesAsync();

            if (_notifier != null)
                await _notifier.NotifyNewGuestbookEntryAsync(eventEntity.Id, dto.AuthorName.Trim());
            return true;
        }

        // Service ou filière choisi par l'auteur : seulement un des choix du bloc RSVP,
        // sinon rien (un choix inconnu ne doit pas faire perdre le vœu).
        private async Task<string?> ServiceOfAsync(Guid eventId, string? service)
        {
            var value = service?.Trim();
            if (string.IsNullOrEmpty(value)) return null;
            var rsvpBlock = await _context.EventBlocks.IgnoreQueryFilters().AsNoTracking()
                .Where(b => b.EventId == eventId && (b.BlockType == "RSVP" || b.BlockType == "Rsvp"))
                .Select(b => b.Content)
                .FirstOrDefaultAsync();
            return RsvpSides.Read(rsvpBlock).Contains(value, StringComparer.Ordinal) ? value : null;
        }

        public async Task<GuestBookEntryDto> CreateAsync(CreateGuestBookEntryDto dto, Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entity = new GuestBookEntry
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                AuthorName = dto.AuthorName,
                Message = dto.Message,
                Status = GuestBookStatus.EnAttente,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.GuestBookEntries.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<List<GuestBookEntryDto>> GetAllAsync(Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entities = await _context.GuestBookEntries
                .Where(g => g.EventId == eventId)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();
            return entities.Select(Map).ToList();
        }

        public async Task<GuestBookEntryDto> UpdateStatusAsync(Guid id, UpdateGuestBookStatusDto dto, Guid organizerId)
        {
            var entity = await _context.GuestBookEntries.FirstOrDefaultAsync(g => g.Id == id && g.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Message {id} introuvable.");

            entity.Status = dto.Status;
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<GuestBookEntryDto> ReplyAsync(Guid id, ReplyGuestBookEntryDto dto, Guid organizerId)
        {
            var entity = await _context.GuestBookEntries.FirstOrDefaultAsync(g => g.Id == id && g.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Message {id} introuvable.");

            entity.Reply = dto.Reply;
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.GuestBookEntries.FirstOrDefaultAsync(g => g.Id == id && g.Event.OrganizerId == organizerId);
            if (entity == null)
                return false;

            _context.GuestBookEntries.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static GuestBookEntryDto Map(GuestBookEntry entity) => new()
        {
            Id = entity.Id,
            AuthorName = entity.AuthorName,
            Message = entity.Message,
            Status = entity.Status,
            Reply = entity.Reply,
            Service = entity.Service,
            Alert = WishAlerts.Detect(entity.Message),
            CreatedAt = entity.CreatedAt
        };
    }
}
