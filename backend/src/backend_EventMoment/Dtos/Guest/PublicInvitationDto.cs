using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Models
{
    public class PublicInvitationDto
    {
        public Guid GuestId { get; set; }
        public string GuestFullName { get; set; } = string.Empty;

        public string EventName { get; set; } = string.Empty;
        // Adresse du site public (/e/{slug}) : l'invitation y renvoie, avec ?invite=.
        public string EventSlug { get; set; } = string.Empty;
        public DateOnly? EventDate { get; set; }
        public TimeOnly? EventStartTime { get; set; }
        public string? ThemeColor { get; set; }
        // Nom du modèle de site (Éclat, Signal...) : l'invitation reprend ses couleurs.
        public string? Template { get; set; }

        public string? LocationLabel { get; set; }
        public string? LocationAddress { get; set; }

        public bool? RsvpConfirmed { get; set; }
        public short RsvpAccompanyingCount { get; set; }
        public string? RsvpMessage { get; set; }

        // L'événement est passé : l'invité ne peut plus modifier sa réponse.
        public bool RsvpClosed { get; set; }
    }

    public class SubmitPublicRsvpDto
    {
        [Required]
        public bool Confirmed { get; set; }

        [Range(0, 20)]
        public short AccompanyingCount { get; set; } = 0;

        [MaxLength(1000)]
        public string? Message { get; set; }
    }
}
