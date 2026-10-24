using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class EventReminderService : IEventReminderService
    {
        private readonly AdminDbContext _context;
        private readonly IPlanService? _plans;

        public EventReminderService(AdminDbContext context, IPlanService? plans = null)
        {
            _context = context;
            _plans = plans;
        }

        private Task<bool> OwnsEventAsync(Guid eventId, Guid organizerId) =>
            _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId);

        public async Task<List<EventReminderDto>> GetAsync(Guid eventId, Guid organizerId)
        {
            if (!await OwnsEventAsync(eventId, organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var existing = await _context.EventReminders.AsNoTracking()
                .Where(r => r.EventId == eventId)
                .ToDictionaryAsync(r => r.Kind);

            // Toujours renvoyer les trois rappels, désactivés par défaut s'ils n'ont
            // jamais été configurés.
            return EventReminderKind.All
                .Select(kind => existing.TryGetValue(kind, out var r)
                    ? Map(r)
                    : new EventReminderDto { Kind = kind, Enabled = false })
                .ToList();
        }

        public async Task<EventReminderDto> SetEnabledAsync(Guid eventId, string kind, bool enabled, Guid organizerId)
        {
            if (!EventReminderKind.All.Contains(kind))
                throw new InvalidOperationException("Type de rappel inconnu.");

            if (!await OwnsEventAsync(eventId, organizerId))
                throw new KeyNotFoundException("Événement introuvable.");
            // Activer un rappel automatique demande une offre qui l'inclut ; le désactiver reste libre.
            if (enabled && _plans != null)
                await _plans.EnsureFeatureAsync(organizerId, PlanFeature.AutoReminders);

            var entity = await _context.EventReminders
                .FirstOrDefaultAsync(r => r.EventId == eventId && r.Kind == kind);
            if (entity == null)
            {
                entity = new EventReminder
                {
                    Id = Guid.NewGuid(),
                    EventId = eventId,
                    Kind = kind,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                _context.EventReminders.Add(entity);
            }

            entity.Enabled = enabled;
            entity.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        private static EventReminderDto Map(EventReminder entity) => new()
        {
            Kind = entity.Kind,
            Enabled = entity.Enabled,
            LastSentAt = entity.LastSentAt
        };
    }
}
