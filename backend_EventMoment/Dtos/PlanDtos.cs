using System.ComponentModel.DataAnnotations;
using backend_EventMoment.Models;

namespace backend_EventMoment.Dtos
{
    // Offre en cours d'un organisateur et son utilisation (carte « Plan » du tableau de bord).
    public class PlanUsageDto
    {
        public string PlanCode { get; set; } = "free";
        public string PlanLabel { get; set; } = "Free";
        public int PriceCents { get; set; }
        public int? MaxEvents { get; set; }
        public int EventsUsed { get; set; }
        public int? MaxGuests { get; set; }
        public DateTimeOffset? EndsAt { get; set; }
        public UpgradeRequestDto? PendingRequest { get; set; }
    }

    public class CreateUpgradeRequestDto
    {
        [Required]
        public Guid PlanId { get; set; }

        // Numéro Mobile Money où l'équipe peut joindre l'organisateur pour le paiement.
        [Required, MaxLength(30), RegularExpression(@"^[0-9+ ().-]{6,30}$", ErrorMessage = "Numéro de téléphone invalide.")]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Message { get; set; }
    }

    public class UpgradeRequestDto
    {
        public Guid Id { get; set; }
        public Guid PlanId { get; set; }
        public string PlanLabel { get; set; } = string.Empty;
        public int PriceCents { get; set; }
        public UpgradeRequestStatus Status { get; set; }
        public string? Phone { get; set; }
        public string? Message { get; set; }
        public string? AdminNote { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? HandledAt { get; set; }
    }

    public class AdminUpgradeRequestDto : UpgradeRequestDto
    {
        public Guid OrganizerId { get; set; }
        public string OrganizerName { get; set; } = string.Empty;
        public string OrganizerEmail { get; set; } = string.Empty;
    }

    public class HandleUpgradeRequestDto
    {
        [MaxLength(500)]
        public string? Note { get; set; }
    }

    public class SaveReviewDto
    {
        [Range(1, 5)]
        public short Rating { get; set; }

        [Required, MinLength(10, ErrorMessage = "Votre commentaire doit faire au moins 10 caractères."), MaxLength(1000)]
        public string Comment { get; set; } = string.Empty;

        [Required, MaxLength(80)]
        public string DisplayName { get; set; } = string.Empty;

        // Ex. « Mariage · Douala » ; affiché sous le nom.
        [MaxLength(80)]
        public string? Context { get; set; }
    }

    public class ReviewDto
    {
        public Guid Id { get; set; }
        public short Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Context { get; set; }
        public PlatformReviewStatus Status { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    // Avis publié, tel qu'affiché sur l'accueil (aucune donnée privée).
    public class PublicReviewDto
    {
        public short Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Context { get; set; }
    }

    public class AdminReviewDto : ReviewDto
    {
        public string OrganizerEmail { get; set; } = string.Empty;
    }

    public class UpdateReviewStatusDto
    {
        [Required]
        public PlatformReviewStatus Status { get; set; }
    }
}
