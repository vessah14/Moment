using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL;

namespace backend_EventMoment.Services
{
    public class PublicSiteService : IPublicSiteService
    {
        private readonly AdminDbContext _context;
        private readonly IPlanService? _plans;

        public PublicSiteService(AdminDbContext context, IPlanService? plans = null)
        {
            _context = context;
            _plans = plans;
        }

        public async Task<List<(string Slug, DateTimeOffset LastModified)>> GetSearchableSitesAsync(int max)
        {
            if (max <= 0) return new List<(string Slug, DateTimeOffset LastModified)>();

            var query = _context.Events.IgnoreQueryFilters().AsNoTracking()
                .Where(e => e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id));

            if (_context.Database.IsNpgsql())
            {
                var searchable = await query
                    .Where(e => EF.Functions.JsonContains(e.CustomFields, """{"options":{"searchable":true}}"""))
                    .OrderByDescending(e => e.UpdatedAt)
                    .Take(max)
                    .Select(e => new { e.Slug, e.UpdatedAt })
                    .ToListAsync();
                return searchable.Select(e => (e.Slug, e.UpdatedAt)).ToList();
            }

            var published = await query
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

        public const int WallItems = 60;

        // Mur du jour J : ne dépend pas des sections affichées sur la page (Galerie, Livre
        // d'or) ; seuls les photos et messages publiés (validés par l'organisateur) y passent.
        public async Task<PublicWallDto?> GetWallAsync(string slug)
        {
            var eventEntity = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(e => e.Slug == slug && e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id));
            if (eventEntity == null) return null;

            var heroContent = await _context.EventBlocks.IgnoreQueryFilters().AsNoTracking()
                .Where(b => b.EventId == eventEntity.Id && b.BlockType == "Hero")
                .Select(b => b.Content)
                .FirstOrDefaultAsync();
            var eventDto = PublicEventMapper.Map(eventEntity, null, heroContent);

            var photos = await _context.GalleryPhotos.IgnoreQueryFilters().AsNoTracking()
                .Where(p => p.EventId == eventEntity.Id && p.Status == GalleryPhotoStatus.Publie)
                .OrderByDescending(p => p.CreatedAt)
                .Take(WallItems)
                .Select(p => new GalleryPhotoDto
                {
                    Id = p.Id,
                    Url = p.Url,
                    Caption = p.Caption,
                    UploadedBy = p.UploadedBy,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt,
                })
                .ToListAsync();
            var messages = await _context.GuestBookEntries.IgnoreQueryFilters().AsNoTracking()
                .Where(g => g.EventId == eventEntity.Id && g.Status == GuestBookStatus.Publie)
                .OrderByDescending(g => g.CreatedAt)
                .Take(WallItems)
                .Select(g => new PublicGuestBookEntryDto
                {
                    AuthorName = g.AuthorName,
                    Message = g.Message,
                    Reply = g.Reply,
                    CreatedAt = g.CreatedAt,
                })
                .ToListAsync();

            return new PublicWallDto
            {
                Slug = eventEntity.Slug,
                Title = string.IsNullOrWhiteSpace(eventDto.HeroTitle) ? eventEntity.Name : eventDto.HeroTitle!,
                ThemeColor = eventDto.HeroColor ?? eventEntity.ThemeColor,
                Photos = photos,
                Messages = messages,
            };
        }

        public async Task<PublicSiteDto?> GetPublicSiteAsync(string slug)
        {
            var eventEntity = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(e => e.Slug == slug && e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id));
            if (eventEntity == null) return null;

            var location = await _context.EventLocations.IgnoreQueryFilters().AsNoTracking()
                .Where(l => l.EventId == eventEntity.Id)
                .OrderBy(l => l.Position)
                .FirstOrDefaultAsync();

            var blocks = await _context.EventBlocks.IgnoreQueryFilters().AsNoTracking()
                .Where(b => b.EventId == eventEntity.Id && b.IsVisible)
                .OrderBy(b => b.Position)
                .Select(b => new PublicSiteBlockDto { BlockType = b.BlockType, Position = b.Position, Content = b.Content })
                .ToListAsync();

            var heroContent = blocks.FirstOrDefault(b => string.Equals(b.BlockType, "Hero", StringComparison.OrdinalIgnoreCase))?.Content;
            var eventDto = PublicEventMapper.Map(eventEntity, location, heroContent);
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
            var ticketSettings = TicketSettings.Read(eventEntity.CustomFields);

            return new PublicSiteDto
            {
                Event = eventDto,
                Blocks = blocks,
                ProgramItems = programItems,
                GalleryPhotos = galleryPhotos,
                GuestBookEntries = guestBookEntries,
                TicketTypes = ticketTypes,
                // Mention « Créé avec TBF MOMENT » retirée pour les offres qui l'incluent (Business et plus).
                TicketStyle = ticketSettings.Style,
                TicketNote = ticketSettings.Note,
                ShowBranding = !branding,
                // Le logo de l'organisateur s'affiche sur toutes les offres (décision du
                // 2026-10-27) ; Business retire seulement la mention TBF MOMENT.
                OrganizerName = organizer.Name,
                OrganizerLogoUrl = organizer.LogoUrl,
            };
        }
    }
}
