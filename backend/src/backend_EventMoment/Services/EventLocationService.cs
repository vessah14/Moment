using backend_EventMoment.Data;
using backend_EventMoment.Dtos.Event;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class EventLocationService : IEventLocationService
    {
        private readonly AdminDbContext _context;

        public EventLocationService(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<EventLocationDto> CreateAsync(CreateEventLocationDto dto, Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entity = new Event_Location
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                Label = dto.Label,
                Address = dto.Address ?? string.Empty,
                Lattitude = dto.Latitude,
                Longitude = dto.Longitude,
                GooglePlaceId = dto.GooglePlaceId,
                Position = dto.Position,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.EventLocations.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<EventLocationDto> GetByIdAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.EventLocations.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Lieu {id} introuvable.");

            return Map(entity);
        }

        public async Task<List<EventLocationDto>> GetAllAsync(Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entities = await _context.EventLocations.AsNoTracking().Where(x => x.EventId == eventId).OrderBy(x => x.Position).ToListAsync();
            return entities.Select(Map).ToList();
        }

        public async Task<EventLocationDto> UpdateAsync(Guid id, UpdateEventLocationDto dto, Guid organizerId)
        {
            var entity = await _context.EventLocations.FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Lieu {id} introuvable.");

            entity.Label = dto.Label;
            entity.Address = dto.Address ?? string.Empty;
            entity.Lattitude = dto.Latitude;
            entity.Longitude = dto.Longitude;
            entity.GooglePlaceId = dto.GooglePlaceId;
            entity.Position = dto.Position;

            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.EventLocations.FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                return false;

            _context.EventLocations.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static EventLocationDto Map(Event_Location entity) => new()
        {
            Id = entity.Id,
            Label = entity.Label,
            Address = entity.Address,
            Latitude = entity.Lattitude,
            Longitude = entity.Longitude,
            GooglePlaceId = entity.GooglePlaceId,
            Position = entity.Position
        };
    }
}
