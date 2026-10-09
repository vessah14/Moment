using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class GuestGroupService : IGuestGroupService
    {
        private readonly AdminDbContext _context;

        public GuestGroupService(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<GuestGroupDto> CreateAsync(CreateGuestGroupDto dto, Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entity = new Guest_group
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                Label = dto.Name,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.GuestGroups.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<GuestGroupDto> GetByIdAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.GuestGroups.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null || !await OwnedByOrganizerAsync(entity.EventId, organizerId))
                throw new KeyNotFoundException($"Groupe {id} introuvable.");

            return Map(entity);
        }

        public async Task<List<GuestGroupDto>> GetAllAsync(Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entities = await _context.GuestGroups.AsNoTracking().Where(x => x.EventId == eventId).OrderBy(x => x.Label).ToListAsync();
            return entities.Select(Map).ToList();
        }

        public async Task<GuestGroupDto> UpdateAsync(Guid id, UpdateGuestGroupDto dto, Guid organizerId)
        {
            var entity = await _context.GuestGroups.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null || !await OwnedByOrganizerAsync(entity.EventId, organizerId))
                throw new KeyNotFoundException($"Groupe {id} introuvable.");

            entity.Label = dto.Name;
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.GuestGroups.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null || !await OwnedByOrganizerAsync(entity.EventId, organizerId))
                return false;

            _context.GuestGroups.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private Task<bool> OwnedByOrganizerAsync(Guid eventId, Guid organizerId) =>
            _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId);

        private static GuestGroupDto Map(Guest_group entity) => new()
        {
            Id = entity.Id,
            Name = entity.Label,
            GuestsCount = 0
        };
    }
}
