using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    // Préférences de notification de l'organisateur. Absence de ligne = valeurs par défaut.
    [Table("organizer_notification_settings")]
    public class OrganizerNotificationSettings
    {
        [Key]
        [Column("organizer_id")]
        public Guid OrganizerId { get; set; }

        [Column("new_rsvp")]
        public bool NewRsvp { get; set; } = true;

        [Column("guestbook")]
        public bool Guestbook { get; set; } = true;

        [Column("payments")]
        public bool Payments { get; set; } = true;

        [Column("reminders")]
        public bool Reminders { get; set; }

        [Column("weekly_summary")]
        public bool WeeklySummary { get; set; } = true;

        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; }
    }
}
