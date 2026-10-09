using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class EventService : IEventService
    {
        private readonly AdminDbContext _context;
        private readonly IUploadStorage? _uploads;
        private readonly IPlanService? _plans;

        public EventService(AdminDbContext context, IUploadStorage? uploads = null, IPlanService? plans = null)
        {
            _context = context;
            _uploads = uploads;
            _plans = plans;
        }

        private static readonly System.Text.RegularExpressions.Regex UploadedCoverPattern =
            new(@"^/uploads/covers/[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}\.(jpg|jpeg|png|webp)$");

        // La couverture est affichée via url(...) dans le CSS du site public : seules les
        // images téléversées sur la plateforme sont acceptées (pas d'URL externe de pistage,
        // pas d'injection CSS). Une ancienne valeur déjà en base reste tolérée tant qu'elle
        // n'est pas modifiée, pour ne pas bloquer l'enregistrement d'événements existants.
        private void EnsureValidCover(string? coverUrl, string? currentValue = null)
        {
            if (string.IsNullOrEmpty(coverUrl) || coverUrl == currentValue)
                return;
            if (!(_uploads?.IsUploadedCover(coverUrl) ?? UploadedCoverPattern.IsMatch(coverUrl)))
                throw new InvalidOperationException("Image de couverture invalide : téléversez-la depuis l'assistant.");
        }

        public async Task<EventDto> CreateAsync(CreateEventDto dto, Guid organizerId)
        {
            EnsureValidCover(dto.CoverImageUrl);
            // Nombre d'événements limité par l'offre (Free : 1, Premium : 5…).
            if (_plans != null)
                await _plans.EnsureCanCreateEventAsync(organizerId);

            var entity = new Event
            {
                Id = Guid.NewGuid(),
                OrganizerId = organizerId,
                CategoryId = dto.CategoryId,
                Name = dto.Name,
                Slug = await SlugGenerator.GenerateUniqueAsync(dto.Name,
                    candidate => _context.Events.IgnoreQueryFilters().AnyAsync(e => e.Slug == candidate)),
                Status = EventStatus.Brouillon,
                EventDate = dto.EventDate,
                StartTime = dto.StartTime,
                CoverImageUrl = dto.CoverImageUrl,
                ThemeColor = dto.ThemeColor,
                ThemeFont = dto.ThemeFont,
                CustomFields = dto.CustomFields,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Events.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<EventDto> GetByIdAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.Events.AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id && e.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Event {id} introuvable.");

            var moderation = await _context.EventModerations.AsNoTracking().FirstOrDefaultAsync(m => m.EventId == id);
            return Map(entity, moderation);
        }

        public async Task<List<EventDto>> GetAllAsync(Guid organizerId)
        {
            var entities = await _context.Events.AsNoTracking()
                .Where(e => e.OrganizerId == organizerId)
                .OrderBy(e => e.CreatedAt)
                .ToListAsync();

            var ids = entities.Select(e => e.Id).ToList();
            var moderations = await _context.EventModerations.AsNoTracking()
                .Where(m => ids.Contains(m.EventId))
                .ToDictionaryAsync(m => m.EventId);
            return entities.Select(e => Map(e, moderations.GetValueOrDefault(e.Id))).ToList();
        }

        public async Task<EventDto> UpdateAsync(Guid id, UpdateEventDto dto, Guid organizerId)
        {
            var entity = await _context.Events.FirstOrDefaultAsync(e => e.Id == id && e.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Event {id} introuvable.");

            EnsureValidCover(dto.CoverImageUrl, entity.CoverImageUrl);

            var moderation = await _context.EventModerations.AsNoTracking().FirstOrDefaultAsync(m => m.EventId == id);
            if (moderation != null && dto.Status == EventStatus.Publie && entity.Status != EventStatus.Publie)
                throw new InvalidOperationException("Cet événement a été suspendu par la modération et ne peut pas être publié.");

            entity.Name = dto.Name;
            entity.CategoryId = dto.CategoryId;
            entity.Status = dto.Status;
            entity.EventDate = dto.EventDate;
            entity.StartTime = dto.StartTime;
            entity.ThemeColor = dto.ThemeColor;
            entity.ThemeFont = dto.ThemeFont;
            entity.CustomFields = dto.CustomFields;
            entity.UpdatedAt = DateTimeOffset.UtcNow;

            var previousCover = entity.CoverImageUrl;
            var coverChanged = previousCover != dto.CoverImageUrl;
            entity.CoverImageUrl = dto.CoverImageUrl;

            await _context.SaveChangesAsync();

            // Nettoyage après l'enregistrement : si la sauvegarde échoue, l'ancienne
            // couverture est toujours référencée et ne doit pas être supprimée.
            if (coverChanged && _uploads != null)
            {
                // Toutes les couvertures de ce dossier encore utilisées par des copies
                // (« Dupliquer »), quel que soit le stockage (/uploads/… ou Cloudinary).
                var coverMarker = UploadPaths.CoverMarker(entity.Id);
                var sharedCovers = await _context.Events.IgnoreQueryFilters()
                    .Where(e => e.Id != entity.Id && e.CoverImageUrl != null && e.CoverImageUrl.Contains(coverMarker))
                    .Select(e => e.CoverImageUrl)
                    .ToListAsync();
                await _uploads.DeleteUnusedCoversAsync(entity.Id, sharedCovers.Append(entity.CoverImageUrl));
            }

            return Map(entity, moderation);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.Events.FirstOrDefaultAsync(e => e.Id == id && e.OrganizerId == organizerId);
            if (entity == null)
                return false;

            // "Dupliquer" réutilise l'URL de couverture de l'original : si une copie s'en sert
            // encore, on garde le dossier des couvertures.
            var coverMarker = UploadPaths.CoverMarker(id);
            var coverStillUsed = await _context.Events.IgnoreQueryFilters()
                .AnyAsync(e => e.Id != id && e.CoverImageUrl != null && e.CoverImageUrl.Contains(coverMarker));

            _context.Events.Remove(entity);
            await _context.SaveChangesAsync();
            if (_uploads != null)
                await _uploads.DeleteEventFilesAsync(id, keepCovers: coverStillUsed);
            return true;
        }

        private static EventDto Map(Event entity) => new()
        {
            Id = entity.Id,
            Name = entity.Name,
            Slug = entity.Slug,
            CategoryId = entity.CategoryId,
            Status = entity.Status,
            EventDate = entity.EventDate,
            StartTime = entity.StartTime,
            CoverImageUrl = entity.CoverImageUrl,
            ThemeColor = entity.ThemeColor,
            ThemeFont = entity.ThemeFont,
            CustomFields = entity.CustomFields
        };

        private static EventDto Map(Event entity, EventModeration? moderation)
        {
            var dto = Map(entity);
            dto.IsSuspended = moderation != null;
            dto.SuspensionReason = moderation?.Reason;
            return dto;
        }
    }
}
