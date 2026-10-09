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
}
