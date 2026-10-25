using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class GiftRegistryService : IGiftRegistryService
    {
        private readonly AdminDbContext _context;

        public GiftRegistryService(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<GiftItemDto> CreateAsync(CreateGiftItemDto dto, Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entity = new GiftItem
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                Name = dto.Name,
                Description = dto.Description,
                PriceCents = dto.PriceCents,
                ImageUrl = dto.ImageUrl,
                IsReserved = false,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.GiftItems.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<List<GiftItemDto>> GetAllAsync(Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entities = await _context.GiftItems
                .Where(g => g.EventId == eventId)
                .OrderBy(g => g.CreatedAt)
                .ToListAsync();
            return entities.Select(Map).ToList();
        }

        public async Task<bool> DeleteAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.GiftItems.FirstOrDefaultAsync(g => g.Id == id && g.Event.OrganizerId == organizerId);
            if (entity == null)
                return false;

            _context.GiftItems.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PublicEventDto?> GetPublicEventAsync(string slug)
        {
            var entity = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(e => e.Slug == slug && e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id));
            if (entity == null) return null;

            var location = await _context.EventLocations.IgnoreQueryFilters().AsNoTracking()
                .Where(l => l.EventId == entity.Id)
                .OrderBy(l => l.Position)
                .FirstOrDefaultAsync();

            string? tagline = null;
            string? description = null;
            string? template = null;
            string? heroTitle = null;
            string? heroSubtitle = null;
            string? heroColor = null;
            string? heroKicker = null;
            var searchable = false;
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(entity.CustomFields);
                if (doc.RootElement.TryGetProperty("tagline", out var t)) tagline = t.GetString();
                if (doc.RootElement.TryGetProperty("description", out var d)) description = d.GetString();
                if (doc.RootElement.TryGetProperty("template", out var tpl) && tpl.ValueKind == System.Text.Json.JsonValueKind.String)
                    template = tpl.GetString();
                searchable = EventSearchability.IsSearchable(doc.RootElement);
            }
            catch
            {
                // CustomFields mal formé ou vide : on affiche simplement la page sans ces champs.
            }

            var heroContent = await _context.EventBlocks.IgnoreQueryFilters().AsNoTracking()
                .Where(block => block.EventId == entity.Id && block.IsVisible && block.BlockType == "Hero")
                .OrderBy(block => block.Position)
                .Select(block => block.Content)
                .FirstOrDefaultAsync();
            if (!string.IsNullOrWhiteSpace(heroContent))
            {
                try
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(heroContent);
                    if (doc.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object)
                    {
                        string? Read(string name) =>
                            doc.RootElement.TryGetProperty(name, out var value)
                            && value.ValueKind == System.Text.Json.JsonValueKind.String
                                ? value.GetString()
                                : null;
                        heroTitle = Read("title");
                        heroSubtitle = Read("subtitle");
                        heroColor = Read("color");
                        heroKicker = Read("kicker");
                    }
                }
                catch (System.Text.Json.JsonException)
                {
                    // Un contenu Hero invalide ne doit pas rendre le site public indisponible.
                }
            }

            return new PublicEventDto
            {
                Name = entity.Name,
                Slug = entity.Slug,
                ThemeColor = entity.ThemeColor,
                CoverImageUrl = entity.CoverImageUrl,
                EventDate = entity.EventDate,
                StartTime = entity.StartTime,
                Tagline = tagline,
                Description = description,
                HeroTitle = heroTitle,
                HeroSubtitle = heroSubtitle,
                HeroColor = heroColor,
                HeroKicker = heroKicker,
                Template = template,
                ThemeFont = entity.ThemeFont,
                LocationLabel = location?.Label,
                LocationAddress = location?.Address,
                Searchable = searchable,
            };
        }

        public async Task<List<GiftItemDto>> GetPublicGiftsAsync(string slug)
        {
            var eventEntity = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(e => e.Slug == slug && e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id));
            if (eventEntity == null) return new List<GiftItemDto>();

            var entities = await _context.GiftItems.IgnoreQueryFilters().AsNoTracking()
                .Where(g => g.EventId == eventEntity.Id)
                .OrderBy(g => g.CreatedAt)
                .ToListAsync();
            return entities.Select(Map).ToList();
        }

        public async Task<GiftItemDto?> ReserveAsync(Guid giftId, ReserveGiftDto dto)
        {
            // Mise à jour conditionnelle atomique (un seul UPDATE ... WHERE IsReserved = false) :
            // élimine la race condition où deux invités réservent le même cadeau en même temps
            // (lecture-puis-écriture séparées permettait aux deux requêtes de passer le contrôle).
            // Seuls les cadeaux d'un événement publié et non suspendu sont réservables :
            // l'endpoint est anonyme, un identifiant de cadeau ne suffit pas à y accéder.
            var rows = await _context.GiftItems.IgnoreQueryFilters()
                .Where(g => g.Id == giftId && !g.IsReserved
                    && g.Event.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == g.EventId))
                .ExecuteUpdateAsync(s => s
                    .SetProperty(g => g.IsReserved, true)
                    .SetProperty(g => g.ReservedByName, dto.ReservedByName)
                    .SetProperty(g => g.ReservedByEmail, dto.ReservedByEmail));

            if (rows == 0) return null;

            var entity = await _context.GiftItems.IgnoreQueryFilters()
                .AsNoTracking()
                .FirstAsync(g => g.Id == giftId);
            return Map(entity);
        }

        private static GiftItemDto Map(GiftItem entity) => new()
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            PriceCents = entity.PriceCents,
            ImageUrl = entity.ImageUrl,
            IsReserved = entity.IsReserved,
            ReservedByName = entity.ReservedByName
        };
    }
}
