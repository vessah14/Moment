using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface INotificationSettingsService
    {
        Task<NotificationSettingsDto> GetAsync(Guid organizerId);
        Task<NotificationSettingsDto> UpdateAsync(Guid organizerId, NotificationSettingsDto dto);
    }

    public interface IEventReminderService
    {
        Task<List<EventReminderDto>> GetAsync(Guid eventId, Guid organizerId);
        Task<EventReminderDto> SetEnabledAsync(Guid eventId, string kind, bool enabled, Guid organizerId);
    }

    // E-mails envoyés à l'organisateur, filtrés par ses préférences de notification.
    public interface IOrganizerNotifier
    {
        Task NotifyNewRsvpAsync(Guid eventId, string guestName, bool confirmed, int accompanyingCount);
        Task NotifyNewGuestbookEntryAsync(Guid eventId, string authorName);
    }
}
