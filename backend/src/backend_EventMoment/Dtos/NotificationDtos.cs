using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class NotificationSettingsDto
    {
        public bool NewRsvp { get; set; } = true;
        public bool Guestbook { get; set; } = true;
        public bool Payments { get; set; } = true;
        public bool Reminders { get; set; }
        public bool WeeklySummary { get; set; } = true;
    }

    public class EventReminderDto
    {
        public string Kind { get; set; } = string.Empty;
        public bool Enabled { get; set; }
        public DateTimeOffset? LastSentAt { get; set; }
    }

    public class UpdateEventReminderDto
    {
        [Required]
        public bool Enabled { get; set; }
    }

    public class OrganizerNotificationDto
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? ReadAt { get; set; }
    }

    public class NotificationFeedDto
    {
        public List<OrganizerNotificationDto> Items { get; set; } = new();
        public int UnreadCount { get; set; }
    }
}
