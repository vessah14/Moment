using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class ProgramService : IProgramService
    {
        private readonly AdminDbContext _context;

        public ProgramService(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<ProgramItemDto> CreateAsync(CreateProgramItemDto dto, Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var position = (short)await _context.ProgramItems.CountAsync(p => p.EventId == eventId);

            var entity = new ProgramItem
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                Title = dto.Title,
                Description = dto.Description,
                Speaker = dto.Speaker,
                Location = dto.Location,
                StartTime = dto.StartTime?.ToUniversalTime(),
                DurationMinutes = dto.DurationMinutes,
                Capacity = dto.Capacity,
                Notify = true,
                Position = position,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.ProgramItems.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<List<ProgramItemDto>> GetAllAsync(Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entities = await _context.ProgramItems
                .Where(p => p.EventId == eventId)
                .OrderBy(p => p.StartTime)
                .ToListAsync();
            return entities.Select(Map).ToList();
        }

        public async Task<ProgramItemDto> UpdateAsync(Guid id, UpdateProgramItemDto dto, Guid organizerId)
        {
            var entity = await _context.ProgramItems.FirstOrDefaultAsync(p => p.Id == id && p.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Activité {id} introuvable.");

            entity.Location = dto.Location;
            entity.Capacity = dto.Capacity;
            entity.Notify = dto.Notify;
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<ProgramItemDto> ToggleNotifyAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.ProgramItems.FirstOrDefaultAsync(p => p.Id == id && p.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Activité {id} introuvable.");

            entity.Notify = !entity.Notify;
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.ProgramItems.FirstOrDefaultAsync(p => p.Id == id && p.Event.OrganizerId == organizerId);
            if (entity == null)
                return false;

            _context.ProgramItems.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ProgramItemDto Map(ProgramItem entity) => new()
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            Speaker = entity.Speaker,
            Location = entity.Location,
            StartTime = entity.StartTime,
            DurationMinutes = entity.DurationMinutes,
            Capacity = entity.Capacity,
            Notify = entity.Notify
        };
    }
}
