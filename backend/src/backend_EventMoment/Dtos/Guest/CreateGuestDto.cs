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

        // Places pour cette invitation, invité compris ; vide = règle de l'événement.
        [Range(1, 50)]
        public short? Seats { get; set; }

        // Envoyer automatiquement le lien d'invitation (confirmation de présence) par e-mail,
        // dès que l'événement est publié.
        public bool SendInvitation { get; set; } = true;

    }

    // Import d'une liste (Excel lu dans le navigateur) : nom, service, téléphone.
    public class ImportGuestsDto
    {
        [Required, MaxLength(2000)]
        public List<ImportGuestRowDto> Rows { get; set; } = new();
    }

    public class ImportGuestRowDto
    {
        [MaxLength(255)]
        public string FullName { get; set; } = string.Empty;

        // Service, filière ou département : devient un groupe d'invités de l'événement.
        [MaxLength(100)]
        public string? Service { get; set; }

        [MaxLength(40)]
        public string? Phone { get; set; }
    }

    public class ImportGuestsResultDto
    {
        public int Added { get; set; }
        // Lignes déjà sur la liste (même téléphone, ou même nom sans téléphone) ou sans nom.
        public int Skipped { get; set; }
        public int Groups { get; set; }
        // Import arrêté par la limite d'invités de l'offre : message à afficher.
        public string? LimitReached { get; set; }
    }
}