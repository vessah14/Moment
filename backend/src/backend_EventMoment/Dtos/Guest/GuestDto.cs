namespace backend_EventMoment.Models
{
    public class GuestDTO
    {
        public Guid Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public Guid? GroupId { get; set; }

        // Places réservées, invité compris (null : règle de l'événement).
        public short? Seats { get; set; }

        // Réponse RSVP de l'invité.
        public GuestStatus Status { get; set; }

        // Arrivée le jour J (null tant que l'invité n'a pas été pointé au check-in).
        public DateTimeOffset? CheckedInAt { get; set; }

        // Lien d'invitation par e-mail : envoyé le…, en attente (événement pas encore
        // publié ou envoi en cours), ou dernière erreur d'envoi. Tout à null : jamais demandé.
        public DateTimeOffset? InvitationSentAt { get; set; }
        public bool InvitationPending { get; set; }
        public string? InvitationError { get; set; }
    }
}