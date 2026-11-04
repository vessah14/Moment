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

    public interface IInAppNotificationService
    {
        Task<NotificationFeedDto> GetAsync(Guid organizerId);
        Task<bool> MarkReadAsync(Guid id, Guid organizerId);
        Task<bool> DeleteAsync(Guid id, Guid organizerId);
        Task<int> MarkAllReadAsync(Guid organizerId);
        Task NotifyGuestbookAsync(Guid eventId, string authorName);
        Task NotifyGuestPhotoAsync(Guid eventId, string? uploadedBy);
        Task NotifyGuestEnRouteAsync(Guid eventId, string guestName);
        Task NotifyRsvpAsync(Guid eventId, string guestName, bool? confirmed, int accompanyingCount);
        Task NotifyGiftReservedAsync(Guid eventId, string giftName, string reservedBy);
        // Fin d'une campagne e-mail envoyée en arrière-plan : nombre envoyé, ou raison de l'échec.
        Task NotifyCampaignSentAsync(Guid eventId, string campaignName, int sentCount, int recipientCount, string? failure);
    }

    // E-mails envoyés à l'organisateur, filtrés par ses préférences de notification.
    public interface IOrganizerNotifier
    {
        Task NotifyNewRsvpAsync(Guid eventId, string guestName, bool? confirmed, int accompanyingCount);
        Task NotifyNewGuestbookEntryAsync(Guid eventId, string authorName);
    }
}
