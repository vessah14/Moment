using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class AdminPlatformService : IAdminPlatformService
    {
        private readonly AdminDbContext _context;

        public AdminPlatformService(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<List<AdminOrganizationDto>> GetOrganizationsAsync()
        {
            var organizers = await _context.Organizers.IgnoreQueryFilters().AsNoTracking()
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            var eventCounts = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .GroupBy(e => e.OrganizerId)
                .Select(g => new { OrganizerId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.OrganizerId, x => x.Count);

            var activeSubscriptions = await _context.OrganizerSubscriptions.IgnoreQueryFilters().AsNoTracking()
                .Include(s => s.Plan)
                .Where(s => s.Status == SubscriptionStatus.Actif || s.Status == SubscriptionStatus.Essai)
                .GroupBy(s => s.OrganizerId)
                .Select(g => g.OrderByDescending(s => s.StartedAt).First())
                .ToDictionaryAsync(s => s.OrganizerId);

            return organizers.Select(o => new AdminOrganizationDto
            {
                Id = o.Id,
                Name = o.FullName,
                Email = o.Email,
                Plan = activeSubscriptions.TryGetValue(o.Id, out var sub) ? sub.Plan.Label : "Free",
                Events = eventCounts.TryGetValue(o.Id, out var count) ? count : 0,
                IsActive = o.IsActive,
                JoinedAt = o.CreatedAt,
            }).ToList();
        }

        public async Task<AdminOrganizationDto> UpdateOrganizationStatusAsync(Guid organizerId, UpdateOrganizationStatusDto dto)
        {
            var organizer = await _context.Organizers.IgnoreQueryFilters()
                .FirstOrDefaultAsync(o => o.Id == organizerId);
            if (organizer == null)
                throw new KeyNotFoundException("Organisateur introuvable.");

            organizer.IsActive = dto.IsActive;
            organizer.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            var events = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .CountAsync(e => e.OrganizerId == organizerId);
            var sub = await _context.OrganizerSubscriptions.IgnoreQueryFilters().AsNoTracking()
                .Include(s => s.Plan)
                .Where(s => s.OrganizerId == organizerId && (s.Status == SubscriptionStatus.Actif || s.Status == SubscriptionStatus.Essai))
                .OrderByDescending(s => s.StartedAt)
                .FirstOrDefaultAsync();

            return new AdminOrganizationDto
            {
                Id = organizer.Id,
                Name = organizer.FullName,
                Email = organizer.Email,
                Plan = sub?.Plan.Label ?? "Free",
                Events = events,
                IsActive = organizer.IsActive,
                JoinedAt = organizer.CreatedAt,
            };
        }

        public async Task<List<AdminPlatformEventDto>> GetEventsAsync()
        {
            var events = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .Include(e => e.Category)
                .Include(e => e.Utilisateur)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            var guestCounts = await _context.Guests.IgnoreQueryFilters().AsNoTracking()
                .GroupBy(g => g.EventId)
                .Select(g => new { EventId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.EventId, x => x.Count);

            var suspendedIds = (await _context.EventModerations.AsNoTracking()
                .Select(m => m.EventId)
                .ToListAsync()).ToHashSet();

            return events
                .Select(e => MapEvent(e, guestCounts.TryGetValue(e.Id, out var c) ? c : 0, suspendedIds.Contains(e.Id)))
                .ToList();
        }

        public async Task<AdminPlatformEventDto> UpdateEventSuspensionAsync(Guid eventId, UpdateEventSuspensionDto dto, Guid adminId)
        {
            var entity = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .Include(e => e.Category)
                .Include(e => e.Utilisateur)
                .FirstOrDefaultAsync(e => e.Id == eventId);
            if (entity == null)
                throw new KeyNotFoundException("Événement introuvable.");

            // La suspension vit dans event_moderations, pas dans events.status : l'organisateur
            // peut modifier le statut de son événement, il ne doit pas pouvoir lever une
            // suspension en le republiant.
            var moderation = await _context.EventModerations.FirstOrDefaultAsync(m => m.EventId == eventId);
            if (dto.Suspended && moderation == null)
            {
                _context.EventModerations.Add(new EventModeration
                {
                    EventId = eventId,
                    Reason = dto.Reason,
                    SuspendedBy = adminId,
                    SuspendedAt = DateTimeOffset.UtcNow
                });
                await _context.SaveChangesAsync();
            }
            else if (!dto.Suspended && moderation != null)
            {
                _context.EventModerations.Remove(moderation);
                await _context.SaveChangesAsync();
            }

            var guestCount = await _context.Guests.IgnoreQueryFilters().AsNoTracking()
                .CountAsync(g => g.EventId == eventId);
            return MapEvent(entity, guestCount, dto.Suspended);
        }

        public async Task<List<AdminModerationItemDto>> GetModerationQueueAsync()
        {
            var guestBookItems = await _context.GuestBookEntries.IgnoreQueryFilters().AsNoTracking()
                .Include(g => g.Event).ThenInclude(e => e.Utilisateur)
                .Where(g => g.Status == GuestBookStatus.Signale)
                .OrderByDescending(g => g.CreatedAt)
                .Select(g => new AdminModerationItemDto
                {
                    Id = g.Id,
                    Type = "Livre d'or",
                    Organization = g.Event.Utilisateur.FullName,
                    Author = g.AuthorName,
                    Content = g.Message,
                    CreatedAt = g.CreatedAt,
                })
                .ToListAsync();

            var galleryItems = await _context.GalleryPhotos.IgnoreQueryFilters().AsNoTracking()
                .Include(p => p.Event).ThenInclude(e => e.Utilisateur)
                .Where(p => p.Status == GalleryPhotoStatus.EnAttente)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new AdminModerationItemDto
                {
                    Id = p.Id,
                    Type = "Galerie",
                    Organization = p.Event.Utilisateur.FullName,
                    Author = p.UploadedBy ?? "Invité",
                    Content = "Photo en attente de modération.",
                    CreatedAt = p.CreatedAt,
                })
                .ToListAsync();

            return guestBookItems.Concat(galleryItems)
                .OrderByDescending(i => i.CreatedAt)
                .ToList();
        }

        public async Task ResolveGuestBookModerationAsync(Guid id, bool keep)
        {
            var entity = await _context.GuestBookEntries.IgnoreQueryFilters()
                .FirstOrDefaultAsync(g => g.Id == id);
            if (entity == null)
                throw new KeyNotFoundException("Message introuvable.");

            entity.Status = keep ? GuestBookStatus.Publie : GuestBookStatus.Masque;
            await _context.SaveChangesAsync();
        }

        public async Task ResolveGalleryModerationAsync(Guid id, bool keep)
        {
            var entity = await _context.GalleryPhotos.IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == id);
            if (entity == null)
                throw new KeyNotFoundException("Photo introuvable.");

            entity.Status = keep ? GalleryPhotoStatus.Publie : GalleryPhotoStatus.Refuse;
            await _context.SaveChangesAsync();
        }

        public async Task<List<AdminTransactionDto>> GetTransactionsAsync()
        {
            var subs = await _context.OrganizerSubscriptions.IgnoreQueryFilters().AsNoTracking()
                .Include(s => s.Plan)
                .OrderByDescending(s => s.StartedAt)
                .Take(50)
                .ToListAsync();

            var organizerNames = await _context.Organizers.IgnoreQueryFilters().AsNoTracking()
                .ToDictionaryAsync(o => o.Id, o => o.FullName);

            return subs.Select(s => new AdminTransactionDto
            {
                Id = s.Id,
                Organization = organizerNames.TryGetValue(s.OrganizerId, out var name) ? name : "—",
                Plan = s.Plan.Label,
                AmountCents = s.Plan.PriceCents,
                Date = s.StartedAt,
            }).ToList();
        }

        private static string StatusLabel(EventStatus status, bool suspended) => suspended ? "Suspendu" : status switch
        {
            EventStatus.Publie => "Publié",
            EventStatus.Archive => "Archivé",
            _ => "Brouillon",
        };

        private static AdminPlatformEventDto MapEvent(Event entity, int guestCount, bool suspended) => new()
        {
            Id = entity.Id,
            Name = entity.Name,
            Organization = entity.Utilisateur.FullName,
            Category = entity.Category.Label,
            Status = StatusLabel(entity.Status, suspended),
            Guests = guestCount,
            EventDate = entity.EventDate,
        };
    }
}
