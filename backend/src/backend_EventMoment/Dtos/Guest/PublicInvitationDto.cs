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
        // Modèle de billet et mention sous le QR code, choisis dans le Builder (null = modèle conseillé).
        public string? TicketStyle { get; set; }
        public string? TicketNote { get; set; }

        public string? LocationLabel { get; set; }
        public string? LocationAddress { get; set; }

        public bool? RsvpConfirmed { get; set; }
        public short RsvpAccompanyingCount { get; set; }
        public string? RsvpMessage { get; set; }
        public string? RsvpSide { get; set; }
        // Réponse « Peut-être » (présence ni confirmée ni déclinée).
        public bool RsvpMaybe { get; set; }
        // Règles du formulaire réglées par l'organisateur (bloc RSVP).
        public DateOnly? RsvpDeadline { get; set; }
        public int RsvpMaxCompanions { get; set; }
        public bool RsvpAllowMaybe { get; set; }

        // L'événement est passé : l'invité ne peut plus modifier sa réponse.
        public bool RsvpClosed { get; set; }

        // Heure de la première entrée scannée (null tant que l'invité n'est pas arrivé).
        public DateTimeOffset? CheckedInAt { get; set; }
    }

    public class SubmitPublicRsvpDto
    {
        [Required]
        public bool Confirmed { get; set; }

        [Range(0, 20)]
        public short AccompanyingCount { get; set; } = 0;

        [MaxLength(1000)]
        public string? Message { get; set; }

        // Un des choix proposés par le bloc RSVP de l'événement (vérifié par le serveur).
        [MaxLength(80)]
        public string? Side { get; set; }

        // « Peut-être » (seulement si l'organisateur le propose) : Confirmed est alors ignoré.
        public bool Maybe { get; set; }
    }

    public class SubmitPublicEventRsvpDto
    {
        [Required, MaxLength(255)]
        public string FullName { get; set; } = string.Empty;

        [Phone, MaxLength(40)]
        public string? Phone { get; set; }

        [EmailAddress, MaxLength(254)]
        public string? Email { get; set; }

        [Required]
        public bool Confirmed { get; set; }

        [Range(0, 20)]
        public short AccompanyingCount { get; set; }

        [MaxLength(1000)]
        public string? Message { get; set; }

        [MaxLength(80)]
        public string? Side { get; set; }

        // « Peut-être » (seulement si l'organisateur le propose) : Confirmed est alors ignoré.
        public bool Maybe { get; set; }
    }
}
