using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Models
{
    public class CreateGuestDto
    {
        [Required, MaxLength(255)]
        public string FullName { get; set; } = string.Empty;

        [Required, Phone]
        public string Phone { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

    }
}