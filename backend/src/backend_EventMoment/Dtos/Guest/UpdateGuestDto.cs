using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Models
{
    public class UpdateGuestDto
    {
        public Guid? GroupId { get; set; }

        [Required, MaxLength(255)]
        public string FullName { get; set; } = string.Empty;

        [Phone]
        public string? Phone { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        // Places pour cette invitation, invité compris ; vide = règle de l'événement.
        [Range(1, 50)]
        public short? Seats { get; set; }

        public GuestStatus Status { get; set; } = GuestStatus.EnAttente;

    }
}