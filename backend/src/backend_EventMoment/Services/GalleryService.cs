using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class GalleryService : IGalleryService
    {
        private readonly AdminDbContext _context;

        public GalleryService(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<GalleryPhotoDto> CreateAsync(string url, string? uploadedBy, Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entity = new GalleryPhoto
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                Url = url,
                UploadedBy = uploadedBy,
                Status = GalleryPhotoStatus.Publie,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.GalleryPhotos.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<List<GalleryPhotoDto>> GetAllAsync(Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entities = await _context.GalleryPhotos
                .Where(p => p.EventId == eventId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
            return entities.Select(Map).ToList();
        }

        public async Task<GalleryPhotoDto> UpdateStatusAsync(Guid id, UpdateGalleryPhotoStatusDto dto, Guid organizerId)
        {
            var entity = await _context.GalleryPhotos.FirstOrDefaultAsync(p => p.Id == id && p.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Média {id} introuvable.");

            entity.Status = dto.Status;
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<string?> DeleteAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.GalleryPhotos.FirstOrDefaultAsync(p => p.Id == id && p.Event.OrganizerId == organizerId);
            if (entity == null)
                return null;

            var url = entity.Url;
            _context.GalleryPhotos.Remove(entity);
            await _context.SaveChangesAsync();
            return url;
        }

        private static GalleryPhotoDto Map(GalleryPhoto entity) => new()
        {
            Id = entity.Id,
            Url = entity.Url,
            Caption = entity.Caption,
            UploadedBy = entity.UploadedBy,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt
        };
    }
}
