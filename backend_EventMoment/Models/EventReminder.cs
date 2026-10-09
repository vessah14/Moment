using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    public static class EventReminderKind
    {
        public const string NonRespondents = "non_respondents";
        public const string DayBefore = "day_before";
        public const string ThankYou = "thank_you";

        public static readonly string[] All = { NonRespondents, DayBefore, ThankYou };
    }

    // Rappel automatique d'un événement, envoyé une seule fois par ReminderDispatcher
    // (LastSentAt renseigné après l'envoi).
    [Table("event_reminders")]
    public class EventReminder
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [MaxLength(30)]
        [Column("kind")]
        public string Kind { get; set; } = string.Empty;

        [Column("enabled")]
        public bool Enabled { get; set; }

        [Column("last_sent_at")]
        public DateTimeOffset? LastSentAt { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; }

        public Event Event { get; set; } = null!;
    }
}
