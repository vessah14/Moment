using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    // Lien d'invitation envoyé par e-mail à un invité (confirmation de présence).
    // SentAt null = à envoyer : InvitationDispatcher l'envoie dès que l'événement est publié.
    // QueuedAt sert aussi de « prochain essai au plus tôt » après un échec d'envoi.
    [Table("guest_invitations")]
    public class GuestInvitation
    {
        [Key]
        [Column("guest_id")]
        public Guid GuestId { get; set; }

        [Column("event_id")]
        public Guid EventId { get; set; }

        [Column("queued_at")]
        public DateTimeOffset QueuedAt { get; set; }

        [Column("sent_at")]
        public DateTimeOffset? SentAt { get; set; }

        [Column("attempts")]
        public short Attempts { get; set; }

        [MaxLength(300)]
        [Column("last_error")]
        public string? LastError { get; set; }
    }
}
