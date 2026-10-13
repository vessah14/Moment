using System.ComponentModel.DataAnnotations;
using backend_EventMoment.Models;

namespace backend_EventMoment.Dtos
{
    public class CreateAdminAccountDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public AdminRole Role { get; set; } = AdminRole.Support;
    }
}