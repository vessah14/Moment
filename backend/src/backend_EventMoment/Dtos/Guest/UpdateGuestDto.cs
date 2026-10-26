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

        public GuestStatus Status { get; set; } = GuestStatus.EnAttente;

    }
}