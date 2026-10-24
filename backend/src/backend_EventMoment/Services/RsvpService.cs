using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class RsvpService : IRsvpService
    {
        private readonly AdminDbContext _context;

        public RsvpService(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<RsvpResponseDto> CreateAsync(CreateRsvpResponseDto dto, Guid guestId, Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId) ||
                !await _context.Guests.AnyAsync(g => g.Id == guestId && g.EventId == eventId))
                throw new KeyNotFoundException("Invité ou événement introuvable.");

            var entity = new RsvpResponse
            {
                Id = Guid.NewGuid(),
                GuestId = guestId,
                EventId = eventId,
                Confirmed = dto.Confirmed,
                AccompanyingCount = dto.AccompanyingCount,
                Message = dto.Message,
                RespondedAt = DateTimeOffset.UtcNow,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.RsvpResponses.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<RsvpResponseDto> GetByIdAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.RsvpResponses.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Réponse RSVP {id} introuvable.");

            return Map(entity);
        }

        public async Task<List<RsvpResponseDto>> GetAllAsync(Guid organizerId, Guid? eventId = null, Guid? guestId = null)
        {
            var query = _context.RsvpResponses.AsNoTracking().Where(x => x.Event.OrganizerId == organizerId);

            if (eventId.HasValue)
                query = query.Where(x => x.EventId == eventId.Value);

            if (guestId.HasValue)
                query = query.Where(x => x.GuestId == guestId.Value);

            var entities = await query.OrderBy(x => x.CreatedAt).ToListAsync();
            return entities.Select(Map).ToList();
        }

        public async Task<RsvpResponseDto> UpdateAsync(Guid id, UpdateRsvpResponseDto dto, Guid organizerId)
        {
            var entity = await _context.RsvpResponses.FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Réponse RSVP {id} introuvable.");

            entity.Confirmed = dto.Confirmed;
            entity.AccompanyingCount = dto.AccompanyingCount;
            entity.Message = dto.Message;
            entity.RespondedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.RsvpResponses.FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                return false;

            _context.RsvpResponses.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static RsvpResponseDto Map(RsvpResponse entity) => new()
        {
            Id = entity.Id,
            GuestId = entity.GuestId,
            GuestFullName = entity.Guest?.FullName ?? string.Empty,
            Confirmed = entity.Confirmed,
            AccompanyingCount = entity.AccompanyingCount,
            Message = entity.Message,
            Side = entity.Side,
            RespondedAt = entity.RespondedAt
        };
    }
}
