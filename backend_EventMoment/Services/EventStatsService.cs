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

            var totalAccompanying = await _context.RsvpResponses
                .Where(r => r.EventId == eventId)
                .SumAsync(r => (int)r.AccompanyingCount);

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
    }
}
