using System.Globalization;
using System.Text;
using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    // Plan de table vu par les invités sur le site public. Respect de la vie privée :
    // - la salle n'expose que les tables (numéro, nom, places), jamais les noms des invités ;
    // - la recherche exige le nom complet (accents, casse et ordre des mots ignorés) et ne
    //   renvoie que la table de cette personne, pas ses voisins de table.
    // Uniquement pour un événement publié, non suspendu, dont la page affiche le bloc
    // « Plan de table ».
    public class PublicSeatingService : IPublicSeatingService
    {
        private const string SeatingBlock = "Plan de table";
        private readonly AdminDbContext _context;

        public PublicSeatingService(AdminDbContext context)
        {
            _context = context;
        }

        private async Task<Guid?> SeatingEventIdAsync(string slug)
        {
            var eventId = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .Where(e => e.Slug == slug && e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id)
                    && _context.EventBlocks.Any(b => b.EventId == e.Id && b.IsVisible && b.BlockType == SeatingBlock))
                .Select(e => (Guid?)e.Id)
                .FirstOrDefaultAsync();
            return eventId;
        }

        public async Task<List<PublicTableDto>?> GetTablesAsync(string slug)
        {
            var eventId = await SeatingEventIdAsync(slug);
            if (eventId == null) return null;

            var tables = await _context.EventTables.IgnoreQueryFilters().AsNoTracking()
                .Where(t => t.EventId == eventId)
                .OrderBy(t => t.Position).ThenBy(t => t.CreatedAt)
                .Select(t => new { t.Id, t.Label, t.Capacity })
                .ToListAsync();

            return tables.Select((t, i) => new PublicTableDto
            {
                Number = i + 1,
                Label = t.Label,
                Capacity = t.Capacity,
            }).ToList();
        }

        public async Task<PublicSeatResultDto?> FindSeatAsync(string slug, string name)
        {
            var eventId = await SeatingEventIdAsync(slug);
            if (eventId == null) return null;

            var wanted = NameKey(name);
            if (wanted.Length < 3) return new PublicSeatResultDto { Found = false };

            var tables = await _context.EventTables.IgnoreQueryFilters().AsNoTracking()
                .Where(t => t.EventId == eventId)
                .OrderBy(t => t.Position).ThenBy(t => t.CreatedAt)
                .Select(t => new { t.Id, t.Label })
                .ToListAsync();

            var seated = await _context.SeatingAssignments.IgnoreQueryFilters().AsNoTracking()
                .Where(a => a.EventId == eventId)
                .Select(a => new { a.TableId, a.Guest.FullName })
                .ToListAsync();

            var matchingTables = seated
                .Where(s => NameKey(s.FullName) == wanted)
                .Select(s => s.TableId)
                .Distinct()
                .ToList();

            // Homonymes placés à des tables différentes : on ne devine pas, l'accueil tranchera.
            if (matchingTables.Count != 1) return new PublicSeatResultDto { Found = false };

            var index = tables.FindIndex(t => t.Id == matchingTables[0]);
            if (index < 0) return new PublicSeatResultDto { Found = false };

            return new PublicSeatResultDto { Found = true, Number = index + 1, Label = tables[index].Label };
        }

        // « Fatou  NDIAYE », « ndiaye fatou », « Fatou Ndiayé » -> « fatou ndiaye ».
        public static string NameKey(string? name)
        {
            if (string.IsNullOrWhiteSpace(name)) return string.Empty;
            var decomposed = name.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder(decomposed.Length);
            foreach (var c in decomposed)
            {
                var category = CharUnicodeInfo.GetUnicodeCategory(c);
                if (category == UnicodeCategory.NonSpacingMark) continue;
                sb.Append(char.IsLetterOrDigit(c) ? char.ToLowerInvariant(c) : ' ');
            }
            var tokens = sb.ToString()
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .OrderBy(t => t, StringComparer.Ordinal);
            return string.Join(' ', tokens);
        }
    }
}
