using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class EventCategoryService : IEventCategoryService
    {
        private readonly AdminDbContext _context;

        public EventCategoryService(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<EventCategoryDto> CreateAsync(CreateEventCategoryDto dto)
        {
            var now = DateTimeOffset.UtcNow;
            var entity = new Event_categorie
            {
                Id = Guid.NewGuid(),
                Code = dto.Code,
                Label = dto.Label,
                Description = dto.Description ?? string.Empty,
                Is_active = true,
                FieldSchema = "[]",
                BlockSchema = "[]",
                CreatedAt = now,
                UpdateAt = now
            };

            _context.EventCategories.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<EventCategoryDto> GetByIdAsync(Guid id)
        {
            var entity = await _context.EventCategories.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
            if (entity == null)
                throw new KeyNotFoundException($"Catégorie {id} introuvable.");

            return Map(entity);
        }

        public async Task<List<EventCategoryDto>> GetAllAsync()
        {
            var entities = await _context.EventCategories.AsNoTracking()
                .Where(e => e.Is_active)
                .OrderBy(e => e.Label)
                .ToListAsync();
            return entities.Select(Map).ToList();
        }

        public async Task<EventCategoryDto> UpdateAsync(Guid id, UpdateEventCategoryDto dto)
        {
            var entity = await _context.EventCategories.FirstOrDefaultAsync(e => e.Id == id);
            if (entity == null)
                throw new KeyNotFoundException($"Catégorie {id} introuvable.");

            entity.Label = dto.Label;
            entity.Description = dto.Description ?? entity.Description;
            entity.Is_active = dto.IsActive;
            entity.UpdateAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.EventCategories.FirstOrDefaultAsync(e => e.Id == id);
            if (entity == null)
                return false;

            _context.EventCategories.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static EventCategoryDto Map(Event_categorie entity) => new()
        {
            Id = entity.Id,
            Code = entity.Code,
            Label = entity.Label,
            Description = entity.Description,
            IsActive = entity.Is_active
        };
    }
}
