using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class EventStatsService : IEventStatsService
    {
        private readonly AdminDbContext _context;

        public EventStatsService(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<EventStatsSummaryDto> GetSummaryAsync(Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var guests = await _context.Guests
                .Where(g => g.EventId == eventId)
                .Select(g => g.Status)
                .ToListAsync();

            // Accompagnants : dernière réponse de chaque invité, seulement s'il vient
            // (un invité qui a confirmé puis refusé, ou passé « Absent » par l'organisateur,
            // ne compte plus ses accompagnants).
            var responses = await _context.RsvpResponses
                .Where(r => r.EventId == eventId)
                .Select(r => new { r.GuestId, r.Confirmed, r.AccompanyingCount, r.CreatedAt, GuestStatus = r.Guest.Status })
                .ToListAsync();
            var totalAccompanying = responses
                .GroupBy(r => r.GuestId)
                .Select(g => g.OrderByDescending(r => r.CreatedAt).First())
                .Where(r => r.Confirmed == true && r.GuestStatus == GuestStatus.Present)
                .Sum(r => (int)r.AccompanyingCount);

            var daily = await _context.EventStatsDailies
                .Where(s => s.EventId == eventId)
                .OrderBy(s => s.StatDate)
                .Select(s => new DailyStatDto { Date = s.StatDate, Visits = s.VisitsCount, Shares = s.SharesCount })
                .ToListAsync();

            return new EventStatsSummaryDto
            {
                TotalGuests = guests.Count,
                ConfirmedGuests = guests.Count(s => s == GuestStatus.Present),
                PendingGuests = guests.Count(s => s == GuestStatus.EnAttente),
                RefusedGuests = guests.Count(s => s == GuestStatus.Absent),
                TotalAccompanying = totalAccompanying,
                TotalVisits = daily.Sum(d => d.Visits),
                TotalShares = daily.Sum(d => d.Shares),
                Daily = daily
            };
        }

        public async Task<bool> RecordAsync(string slug, EventStatKind kind)
        {
            // Appel anonyme : on ignore les filtres par organisateur.
            var eventId = await _context.Events.IgnoreQueryFilters()
                .Where(e => e.Slug == slug && e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id))
                .Select(e => (Guid?)e.Id)
                .FirstOrDefaultAsync();
            if (eventId == null) return false;

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            int visits = kind == EventStatKind.Visit ? 1 : 0, shares = kind == EventStatKind.Share ? 1 : 0;

            if (_context.Database.IsNpgsql())
            {
                // Incrément atomique : pas de perte quand plusieurs visiteurs arrivent en même temps.
                await _context.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO event_stats_daily (event_id, stat_date, visits_count, shares_count)
                    VALUES ({eventId.Value}, {today}, {visits}, {shares})
                    ON CONFLICT (event_id, stat_date) DO UPDATE
                    SET visits_count = event_stats_daily.visits_count + EXCLUDED.visits_count,
                        shares_count = event_stats_daily.shares_count + EXCLUDED.shares_count");
                return true;
            }

            // Autres fournisseurs (tests) : lecture puis écriture.
            var row = await _context.EventStatsDailies.IgnoreQueryFilters()
                .FirstOrDefaultAsync(s => s.EventId == eventId.Value && s.StatDate == today);
            if (row == null)
            {
                row = new EventStatsDaily { Id = Guid.NewGuid(), EventId = eventId.Value, StatDate = today };
                _context.EventStatsDailies.Add(row);
            }
            row.VisitsCount += visits;
            row.SharesCount += shares;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
