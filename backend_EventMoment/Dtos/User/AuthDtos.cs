using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos.User
{
    public class LoginDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTimeOffset Expiration { get; set; }
        public object Utilisateur { get; set; } = null!;
    }

    // Connexion admin : après le mot de passe, la double authentification est obligatoire.
    // Token vide tant que le code n'a pas été validé.
    public class AdminLoginResponseDto : LoginResponseDto
    {
        public bool MfaRequired { get; set; }
        // Premier passage : l'administrateur doit d'abord enregistrer l'application.
        public bool MfaSetupRequired { get; set; }
        public string? MfaToken { get; set; }
        public string? OtpAuthUri { get; set; }
        public string? MfaSecret { get; set; }
    }

    public class AdminMfaLoginDto
    {
        [Required, MaxLength(2048)]
        public string MfaToken { get; set; } = string.Empty;

        [Required, MaxLength(12)]
        public string Code { get; set; } = string.Empty;
    }

    public class SignupDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required, Compare(nameof(Password))]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string FullName { get; set; } = string.Empty;

        [Phone]
        public string? Phone { get; set; }
    }

    public class DemanderResetPasswordDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    public class VerifyEmailDto
    {
        [Required]
        public string Token { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        [Required]
        public string Token { get; set; } = string.Empty;

        [Required, MinLength(8)]
        public string NewPassword { get; set; } = string.Empty;

        [Required, Compare(nameof(NewPassword))]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required, MinLength(8)]
        public string NewPassword { get; set; } = string.Empty;

        [Required, Compare(nameof(NewPassword))]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    // Connexion Google : jeton d'accès (bouton du site, fenêtre OAuth) ou ID token
    // (bouton officiel Google). L'un des deux est requis.
    public class GoogleAuthDto
    {
        [MaxLength(4096)]
        public string? IdToken { get; set; }

        [MaxLength(4096)]
        public string? AccessToken { get; set; }
    }

    // Connexion Facebook : code à usage unique renvoyé par Facebook (flux recommandé, le
    // jeton n'apparaît jamais dans le navigateur), ou jeton d'accès (ancien flux).
    public class FacebookAuthDto
    {
        [MaxLength(4096)]
        public string? AccessToken { get; set; }

        [MaxLength(4096)]
        public string? Code { get; set; }
    }
}