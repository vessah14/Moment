namespace backend_EventMoment.Models
{
    public class GuestDTO
    {
        public Guid Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public Guid? GroupId { get; set; }

        // Réponse RSVP de l'invité.
        public GuestStatus Status { get; set; }

        // Arrivée le jour J (null tant que l'invité n'a pas été pointé au check-in).
        public DateTimeOffset? CheckedInAt { get; set; }
    }
}