using System.ComponentModel.DataAnnotations;
using backend_EventMoment.Models;

namespace backend_EventMoment.Dtos
{
    public class CreateCampaignDto
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Channel { get; set; } = string.Empty;

        [Required]
        public string Audience { get; set; } = "Tous les invités";

        [Required, MaxLength(2000)]
        public string Body { get; set; } = string.Empty;

        public bool SendNow { get; set; }
    }

    // Modification d'une campagne pas encore envoyée (le canal ne change pas).
    public class UpdateCampaignDto
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Audience { get; set; } = "Tous les invités";

        [Required, MaxLength(2000)]
        public string Body { get; set; } = string.Empty;

        // Envoyer maintenant (e-mail) après l'enregistrement.
        public bool SendNow { get; set; }
    }

    public class CampaignDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Channel { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public CampaignStatus Status { get; set; }
        public int RecipientCount { get; set; }
        public int EmailsSentCount { get; set; }
        public string? DeliveryError { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? SentAt { get; set; }
    }
}
