using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    // La présence d'une ligne signifie que l'organisateur a prouvé qu'il contrôle son
    // adresse e-mail (lien de vérification, ou connexion Google/Facebook avec e-mail vérifié).
    [Table("organizer_email_verifications")]
    public class OrganizerEmailVerification
    {
        [Key]
        [Column("organizer_id")]
        public Guid OrganizerId { get; set; }

        [Column("verified_at")]
        public DateTimeOffset VerifiedAt { get; set; }
    }
}
