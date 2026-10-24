using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class PublicSiteService : IPublicSiteService
    {
        private readonly AdminDbContext _context;
        private readonly IGiftRegistryService _giftRegistryService;
        private readonly IPlanService? _plans;

        public PublicSiteService(AdminDbContext context, IGiftRegistryService giftRegistryService, IPlanService? plans = null)
        {
            _context = context;
            _giftRegistryService = giftRegistryService;
            _plans = plans;
        }

        public async Task<List<(string Slug, DateTimeOffset LastModified)>> GetSearchableSitesAsync(int max)
        {
            var published = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .Where(e => e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id))
                .OrderByDescending(e => e.UpdatedAt)
                .Select(e => new { e.Slug, e.CustomFields, e.UpdatedAt })
                .ToListAsync();

            // L'option vit dans le JSON CustomFields : filtrée ici plutôt qu'en SQL.
            return published
                .Where(e => EventSearchability.IsSearchable(e.CustomFields))
                .Take(max)
                .Select(e => (e.Slug, e.UpdatedAt))
                .ToList();
        }

        public async Task<PublicSiteDto?> GetPublicSiteAsync(string slug)
        {
            var eventDto = await _giftRegistryService.GetPublicEventAsync(slug);
            if (eventDto == null) return null;

            var eventEntity = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(e => e.Slug == slug && e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id));
            if (eventEntity == null) return null;

            var blocks = await _context.EventBlocks.IgnoreQueryFilters().AsNoTracking()
                .Where(b => b.EventId == eventEntity.Id && b.IsVisible)
                .OrderBy(b => b.Position)
                .Select(b => new PublicSiteBlockDto { BlockType = b.BlockType, Position = b.Position, Content = b.Content })
                .ToListAsync();

            var blockTypes = blocks.Select(b => b.BlockType).ToHashSet(StringComparer.OrdinalIgnoreCase);

            var programItems = blockTypes.Contains("Programme")
                ? await _context.ProgramItems.IgnoreQueryFilters().AsNoTracking()
                    .Where(p => p.EventId == eventEntity.Id)
                    .OrderBy(p => p.StartTime).ThenBy(p => p.Position)
                    .Select(p => new ProgramItemDto
                    {
                        Id = p.Id,
                        Title = p.Title,
                        Description = p.Description,
                        Speaker = p.Speaker,
                        Location = p.Location,
                        StartTime = p.StartTime,
                        DurationMinutes = p.DurationMinutes,
                        Capacity = p.Capacity,
                        Notify = p.Notify,
                    })
                    .ToListAsync()
                : new List<ProgramItemDto>();

            var galleryPhotos = blockTypes.Contains("Galerie")
                ? await _context.GalleryPhotos.IgnoreQueryFilters().AsNoTracking()
                    .Where(p => p.EventId == eventEntity.Id && p.Status == GalleryPhotoStatus.Publie)
                    .OrderByDescending(p => p.CreatedAt)
                    .Select(p => new GalleryPhotoDto
                    {
                        Id = p.Id,
                        Url = p.Url,
                        Caption = p.Caption,
                        UploadedBy = p.UploadedBy,
                        Status = p.Status,
                        CreatedAt = p.CreatedAt,
                    })
                    .ToListAsync()
                : new List<GalleryPhotoDto>();

            var guestBookEntries = blockTypes.Contains("Livre d'or")
                ? await _context.GuestBookEntries.IgnoreQueryFilters().AsNoTracking()
                    .Where(g => g.EventId == eventEntity.Id && g.Status == GuestBookStatus.Publie)
                    .OrderByDescending(g => g.CreatedAt)
                    .Take(20)
                    .Select(g => new PublicGuestBookEntryDto
                    {
                        AuthorName = g.AuthorName,
                        Message = g.Message,
                        Reply = g.Reply,
                        CreatedAt = g.CreatedAt,
                    })
                    .ToListAsync()
                : new List<PublicGuestBookEntryDto>();

            var ticketTypes = blockTypes.Contains("Billetterie")
                ? await _context.TicketTypes.IgnoreQueryFilters().AsNoTracking()
                    .Where(t => t.EventId == eventEntity.Id)
                    .Select(t => new TicketTypeDto
                    {
                        Id = t.Id,
                        Name = t.Name,
                        PriceCents = t.PriceCents,
                        Quota = t.Quota,
                        SoldCount = t.SoldCount,
                    })
                    .ToListAsync()
                : new List<TicketTypeDto>();

            var branding = _plans != null && await _plans.HasFeatureAsync(eventEntity.OrganizerId, PlanFeature.Branding);
            var organizer = OrganizerSettings.Read(eventEntity.CustomFields);

            return new PublicSiteDto
            {
                Event = eventDto,
                Blocks = blocks,
                ProgramItems = programItems,
                GalleryPhotos = galleryPhotos,
                GuestBookEntries = guestBookEntries,
                TicketTypes = ticketTypes,
                // Mention « Créé avec TBF MOMENT » retirée pour les offres qui l'incluent (Business et plus).
                TicketStyle = TicketSettings.Read(eventEntity.CustomFields).Style,
                TicketNote = TicketSettings.Read(eventEntity.CustomFields).Note,
                ShowBranding = !branding,
                OrganizerName = organizer.Name,
                OrganizerLogoUrl = branding ? organizer.LogoUrl : null,
            };
        }
    }
}
