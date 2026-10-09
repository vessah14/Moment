using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    // Arrivée effective d'un invité le jour J (scan du QR ou validation manuelle).
    // Volontairement distinct de Guest.Status, qui est la réponse RSVP de l'invité :
    // "a confirmé qu'il viendrait" n'est pas "est arrivé".
    [Table("guest_checkins")]
    public class GuestCheckin
    {
        [Key]
        [Column("guest_id")]
        public Guid GuestId { get; set; }

        [Column("event_id")]
        public Guid EventId { get; set; }

        [Column("checked_in_at")]
        public DateTimeOffset CheckedInAt { get; set; }
    }
}
