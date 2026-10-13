using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Models
{
    public class CreateGuestDto
    {
        [Required, MaxLength(255)]
        public string FullName { get; set; } = string.Empty;

        [Required, Phone]
        public string Phone { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        // Envoyer automatiquement le lien d'invitation (confirmation de présence) par e-mail,
        // dès que l'événement est publié.
        public bool SendInvitation { get; set; } = true;

    }
}