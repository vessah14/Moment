using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class EventBlockService : IEventBlockService
    {
        private readonly AdminDbContext _context;

        public EventBlockService(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<EventBlockDto> CreateAsync(CreateEventBlockDto dto, Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entity = new EventBlock
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                BlockType = dto.BlockType,
                Position = dto.Position,
                IsVisible = dto.IsVisible,
                Content = dto.Content,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.EventBlocks.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<EventBlockDto> GetByIdAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.EventBlocks.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Bloc {id} introuvable.");

            return Map(entity);
        }

        public async Task<List<EventBlockDto>> GetAllAsync(Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entities = await _context.EventBlocks.AsNoTracking().Where(x => x.EventId == eventId).OrderBy(x => x.Position).ToListAsync();
            return entities.Select(Map).ToList();
        }

        public async Task<EventBlockDto> UpdateAsync(Guid id, UpdateEventBlockDto dto, Guid organizerId)
        {
            var entity = await _context.EventBlocks.FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Bloc {id} introuvable.");

            entity.BlockType = dto.BlockType;
            entity.Position = dto.Position;
            entity.IsVisible = dto.IsVisible;
            entity.Content = dto.Content;
            entity.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public const int MaxBlocksPerPage = 60;

        // Enregistrement de toute la page du Builder en une fois : les blocs remplacent ceux
        // de l'événement, dans l'ordre reçu (positions 0, 1, 2…), tout ou rien. Remplace la
        // suite d'appels bloc par bloc, qui laissait la page à moitié enregistrée au moindre
        // échec et butait sur la contrainte unique (event_id, position) — « Conflit de données ».
        public async Task<List<EventBlockDto>> ReplaceAllAsync(Guid eventId, List<CreateEventBlockDto> blocks, Guid organizerId)
        {
            if (blocks.Count > MaxBlocksPerPage)
                throw new InvalidOperationException($"Une page compte au plus {MaxBlocksPerPage} sections.");

            // Un même type de section n'apparaît qu'une fois : la dernière version reçue l'emporte.
            var seen = new HashSet<string>(StringComparer.Ordinal);
            var unique = blocks.AsEnumerable().Reverse().Where(b => seen.Add(b.BlockType)).Reverse().ToList();

            // Verrou par organisateur : deux enregistrements simultanés (double appui, deux
            // onglets) passent l'un après l'autre au lieu de se percuter.
            await using var transaction = await OrganizerLock.BeginAsync(_context, organizerId);
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var existing = await _context.EventBlocks.Where(b => b.EventId == eventId).ToListAsync();
            _context.EventBlocks.RemoveRange(existing);
            await _context.SaveChangesAsync();

            var now = DateTimeOffset.UtcNow;
            var entities = unique.Select((dto, index) => new EventBlock
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                BlockType = dto.BlockType,
                Position = (short)index,
                IsVisible = dto.IsVisible,
                Content = dto.Content,
                CreatedAt = now,
                UpdatedAt = now,
            }).ToList();
            _context.EventBlocks.AddRange(entities);
            await _context.SaveChangesAsync();
            if (transaction != null)
                await transaction.CommitAsync();

            return entities.Select(Map).ToList();
        }

        public async Task<bool> DeleteAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.EventBlocks.FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                return false;

            _context.EventBlocks.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static EventBlockDto Map(EventBlock entity) => new()
        {
            Id = entity.Id,
            BlockType = entity.BlockType,
            Position = entity.Position,
            IsVisible = entity.IsVisible,
            Content = entity.Content
        };
    }
}
