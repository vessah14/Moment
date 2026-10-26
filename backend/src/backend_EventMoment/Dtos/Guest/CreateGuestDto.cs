using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Models
{
    public class CreateGuestDto
    {
        [Required, MaxLength(255)]
        public string FullName { get; set; } = string.Empty;

        [Phone]
        public string? Phone { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        // Envoyer automatiquement le lien d'invitation (confirmation de présence) par e-mail,
        // dès que l'événement est publié.
        public bool SendInvitation { get; set; } = true;

    }
}