using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos.User
{
    public class CreateUtilisateurDtos
    {
        [Required, StringLength(100, MinimumLength = 3)]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        [Required, MinLength(8, ErrorMessage = "Le mot de passe doit contenir au moins 8 caractères.")]
        public string Password { get; set; } = string.Empty;

        [Required, Compare(nameof(Password), ErrorMessage = "Les mots de passe ne correspondent pas.")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class UpdateUtilisateurDtos
    {
        [Required, StringLength(100, MinimumLength = 3)]
        public string FullName { get; set; } = string.Empty;

        public string? Phone { get; set; }
    }

    public class UtilisateurDtos
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public bool IsActive { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public bool EmailVerified { get; set; }
    }
}