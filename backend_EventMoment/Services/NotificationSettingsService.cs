using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class NotificationSettingsService : INotificationSettingsService
    {
        private readonly AdminDbContext _context;

        public NotificationSettingsService(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<NotificationSettingsDto> GetAsync(Guid organizerId)
        {
            var entity = await _context.OrganizerNotificationSettings.AsNoTracking()
                .FirstOrDefaultAsync(s => s.OrganizerId == organizerId);
            return Map(entity ?? new OrganizerNotificationSettings { OrganizerId = organizerId });
        }

        public async Task<NotificationSettingsDto> UpdateAsync(Guid organizerId, NotificationSettingsDto dto)
        {
            var entity = await _context.OrganizerNotificationSettings
                .FirstOrDefaultAsync(s => s.OrganizerId == organizerId);
            if (entity == null)
            {
                entity = new OrganizerNotificationSettings { OrganizerId = organizerId };
                _context.OrganizerNotificationSettings.Add(entity);
            }

            entity.NewRsvp = dto.NewRsvp;
            entity.Guestbook = dto.Guestbook;
            entity.Payments = dto.Payments;
            entity.Reminders = dto.Reminders;
            entity.WeeklySummary = dto.WeeklySummary;
            entity.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return Map(entity);
        }

        private static NotificationSettingsDto Map(OrganizerNotificationSettings entity) => new()
        {
            NewRsvp = entity.NewRsvp,
            Guestbook = entity.Guestbook,
            Payments = entity.Payments,
            Reminders = entity.Reminders,
            WeeklySummary = entity.WeeklySummary
        };
    }
}
