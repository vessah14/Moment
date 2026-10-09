using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    // Suspension d'un événement par la modération. La présence d'une ligne signifie
    // "suspendu" : ce n'est volontairement pas un statut de events.status, que
    // l'organisateur peut modifier librement (il pourrait sinon lever la suspension).
    [Table("event_moderations")]
    public class EventModeration
    {
        [Key]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [MaxLength(500)]
        [Column("reason")]
        public string? Reason { get; set; }

        [Column("suspended_by")]
        public Guid? SuspendedBy { get; set; }

        [Column("suspended_at")]
        public DateTimeOffset SuspendedAt { get; set; }

        public Event Event { get; set; } = null!;
    }
}
