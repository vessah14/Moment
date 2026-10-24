using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class SeatingService : ISeatingService
    {
        private readonly AdminDbContext _context;
        private readonly IPlanService? _plans;

        public SeatingService(AdminDbContext context, IPlanService? plans = null)
        {
            _context = context;
            _plans = plans;
        }

        // Plan de table réservé aux offres qui l'incluent (Premium et plus).
        private Task EnsureSeatingAsync(Guid organizerId) =>
            _plans?.EnsureFeatureAsync(organizerId, PlanFeature.Seating) ?? Task.CompletedTask;

        private Task<bool> OwnsEventAsync(Guid eventId, Guid organizerId) =>
            _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId);

        public async Task<EventTableDto> CreateTableAsync(CreateEventTableDto dto, Guid eventId, Guid organizerId)
        {
            if (!await OwnsEventAsync(eventId, organizerId))
                throw new KeyNotFoundException("Événement introuvable.");
            await EnsureSeatingAsync(organizerId);

            var entity = new EventTable
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                Label = dto.Label,
                Capacity = dto.Capacity,
                Position = dto.Position,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.EventTables.Add(entity);
            await _context.SaveChangesAsync();
            return new EventTableDto { Id = entity.Id, Label = entity.Label, Capacity = entity.Capacity, Position = entity.Position, AssignedCount = 0 };
        }

        public async Task<List<EventTableDto>> GetTablesAsync(Guid eventId, Guid organizerId)
        {
            if (!await OwnsEventAsync(eventId, organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var tables = await _context.EventTables
                .Where(t => t.EventId == eventId)
                .OrderBy(t => t.Position)
                .ToListAsync();

            var counts = await _context.SeatingAssignments
                .Where(a => a.EventId == eventId)
                .GroupBy(a => a.TableId)
                .Select(g => new { TableId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.TableId, g => g.Count);

            return tables.Select(t => new EventTableDto
            {
                Id = t.Id,
                Label = t.Label,
                Capacity = t.Capacity,
                Position = t.Position,
                AssignedCount = counts.GetValueOrDefault(t.Id)
            }).ToList();
        }

        public async Task<bool> DeleteTableAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.EventTables.FirstOrDefaultAsync(t => t.Id == id && t.Event.OrganizerId == organizerId);
            if (entity == null)
                return false;

            _context.EventTables.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SeatingAssignmentDto> AssignGuestAsync(CreateSeatingAssignmentDto dto, Guid eventId, Guid organizerId)
        {
            if (!await OwnsEventAsync(eventId, organizerId))
                throw new KeyNotFoundException("Événement introuvable.");
            await EnsureSeatingAsync(organizerId);

            if (!await _context.Guests.AnyAsync(g => g.Id == dto.GuestId && g.EventId == eventId))
                throw new KeyNotFoundException("Invité introuvable pour cet événement.");

            var table = await _context.EventTables.AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == dto.TableId && t.EventId == eventId);
            if (table == null)
                throw new KeyNotFoundException("Table introuvable pour cet événement.");

            var existing = await _context.SeatingAssignments.FirstOrDefaultAsync(a => a.GuestId == dto.GuestId);

            var alreadyAtThisTable = existing?.TableId == dto.TableId;
            if (!alreadyAtThisTable
                && await _context.SeatingAssignments.CountAsync(a => a.TableId == dto.TableId) >= table.Capacity)
                throw new InvalidOperationException($"La table « {table.Label} » est complète ({table.Capacity} places).");
            if (existing != null)
            {
                existing.TableId = dto.TableId;
            }
            else
            {
                existing = new SeatingAssignment
                {
                    Id = Guid.NewGuid(),
                    EventId = eventId,
                    GuestId = dto.GuestId,
                    TableId = dto.TableId,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                _context.SeatingAssignments.Add(existing);
            }

            await _context.SaveChangesAsync();

            var guest = await _context.Guests.AsNoTracking().FirstAsync(g => g.Id == dto.GuestId);
            return new SeatingAssignmentDto
            {
                Id = existing.Id,
                GuestId = existing.GuestId,
                GuestFullName = guest.FullName,
                TableId = existing.TableId
            };
        }

        public async Task<List<SeatingAssignmentDto>> GetAssignmentsAsync(Guid eventId, Guid organizerId)
        {
            if (!await OwnsEventAsync(eventId, organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            return await _context.SeatingAssignments
                .Where(a => a.EventId == eventId)
                .Select(a => new SeatingAssignmentDto
                {
                    Id = a.Id,
                    GuestId = a.GuestId,
                    GuestFullName = a.Guest.FullName,
                    TableId = a.TableId
                })
                .ToListAsync();
        }

        public async Task<bool> UnassignGuestAsync(Guid guestId, Guid organizerId)
        {
            var entity = await _context.SeatingAssignments.FirstOrDefaultAsync(a => a.GuestId == guestId && a.Event.OrganizerId == organizerId);
            if (entity == null)
                return false;

            _context.SeatingAssignments.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
