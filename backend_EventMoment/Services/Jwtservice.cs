using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend_EventMoment.Models;

namespace backend_EventMoment.Services
{
    public class JwtService
    {
        private readonly IConfiguration _config;

        public JwtService(IConfiguration config)
        {
            _config = config;
        }

        // Heure de la connexion d'origine, recopiée à chaque renouvellement : la session a
        // une durée maximale même pour un utilisateur toujours actif (Jwt:MaxSessionHours).
        public const string AuthTimeClaim = "auth_time";

        public TimeSpan MaxSessionLifetime =>
            TimeSpan.FromHours(double.TryParse(_config["Jwt:MaxSessionHours"], out var hours) && hours > 0 ? hours : 12);

        public (string Token, DateTimeOffset Expiration) GenerateOrganizerToken(Utilisateur organizer, DateTimeOffset? authTime = null)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, organizer.Id.ToString()),
                new Claim(ClaimTypes.Email, organizer.Email),
                new Claim("type", "organizer"),
                new Claim("Utilisateur_id", organizer.Id.ToString()),
                new Claim("session_version", organizer.UpdatedAt.ToUnixTimeMilliseconds().ToString()),
                new Claim(AuthTimeClaim, (authTime ?? DateTimeOffset.UtcNow).ToUnixTimeSeconds().ToString())
            };

            return GenerateToken(claims);
        }

        // Jeton de réinitialisation de mot de passe : courte durée de vie, claim "type"
        // dédié (jamais accepté par le middleware d'authentification standard, qui ne
        // reconnaît que "organizer"/"admin" — voir Program.cs OnTokenValidated), et
        // "session_version" figé sur le UpdatedAt actuel de l'utilisateur. Le reset
        // change PasswordHash + UpdatedAt, donc un jeton déjà utilisé ne correspond
        // plus à la version stockée et devient automatiquement invalide (même logique
        // que l'invalidation de session sur changement de mot de passe).
        public (string Token, DateTimeOffset Expiration) GeneratePasswordResetToken(Utilisateur organizer)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, organizer.Id.ToString()),
                new Claim("type", "password_reset"),
                new Claim("session_version", organizer.UpdatedAt.ToUnixTimeMilliseconds().ToString())
            };

            return GenerateToken(claims, TimeSpan.FromMinutes(30));
        }

        // Jeton de vérification d'e-mail : claim "type" dédié (refusé par le middleware
        // d'authentification, comme password_reset) et adresse e-mail figée — si l'adresse
        // du compte change entre-temps, le lien ne vérifie plus rien.
        public (string Token, DateTimeOffset Expiration) GenerateEmailVerificationToken(Utilisateur organizer)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, organizer.Id.ToString()),
                new Claim(ClaimTypes.Email, organizer.Email),
                new Claim("type", "email_verify")
            };

            return GenerateToken(claims, TimeSpan.FromHours(48));
        }

        public bool TryValidateEmailVerificationToken(string token, out Guid organizerId, out string email)
        {
            organizerId = Guid.Empty;
            email = string.Empty;

            var principal = ValidateTypedToken(token, "email_verify");
            if (principal == null)
                return false;

            email = principal.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
            return Guid.TryParse(principal.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId)
                && !string.IsNullOrWhiteSpace(email);
        }

        // Valide un jeton émis par GeneratePasswordResetToken : signature, émetteur,
        // audience, expiration et claim "type" == "password_reset". Ne consulte pas la
        // base — c'est à l'appelant de comparer le "session_version" retourné au
        // UpdatedAt courant de l'utilisateur pour détecter un jeton déjà consommé.
        public bool TryValidatePasswordResetToken(string token, out Guid organizerId, out long sessionVersion)
        {
            organizerId = Guid.Empty;
            sessionVersion = 0;

            var keyValue = _config["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(keyValue))
                throw new InvalidOperationException("La clé JWT doit être fournie par une variable d'environnement ou User Secrets.");

            var handler = new JwtSecurityTokenHandler();
            var parameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _config["Jwt:Issuer"],
                ValidAudience = _config["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyValue)),
                ClockSkew = TimeSpan.Zero
            };

            ClaimsPrincipal principal;
            try
            {
                principal = handler.ValidateToken(token, parameters, out _);
            }
            catch
            {
                return false;
            }

            if (principal.FindFirst("type")?.Value != "password_reset")
                return false;

            if (!Guid.TryParse(principal.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId))
                return false;

            if (!long.TryParse(principal.FindFirst("session_version")?.Value, out sessionVersion))
                return false;

            return true;
        }

        private ClaimsPrincipal? ValidateTypedToken(string token, string expectedType)
        {
            var keyValue = _config["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(keyValue))
                throw new InvalidOperationException("La clé JWT doit être fournie par une variable d'environnement ou User Secrets.");

            var parameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _config["Jwt:Issuer"],
                ValidAudience = _config["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyValue)),
                ClockSkew = TimeSpan.Zero
            };

            try
            {
                var principal = new JwtSecurityTokenHandler().ValidateToken(token, parameters, out _);
                return principal.FindFirst("type")?.Value == expectedType ? principal : null;
            }
            catch
            {
                return null;
            }
        }

        public (string Token, DateTimeOffset Expiration) GenerateAdminToken(AdminAccount admin)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
                new Claim(ClaimTypes.Email, admin.Email),
                new Claim("type", "admin"),
                new Claim(ClaimTypes.Role, admin.Role.ToString()),
                new Claim("session_version", admin.UpdatedAt.ToUnixTimeMilliseconds().ToString())
            };

            return GenerateToken(claims);
        }

        private (string Token, DateTimeOffset Expiration) GenerateToken(Claim[] claims, TimeSpan? lifetime = null)
        {
            var keyValue = _config["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(keyValue))
                throw new InvalidOperationException("La clé JWT doit être fournie par une variable d'environnement ou User Secrets.");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyValue));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiration = DateTimeOffset.UtcNow.Add(lifetime ?? TimeSpan.FromMinutes(double.Parse(_config["Jwt:ExpiresInMinutes"]!)));

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expiration.UtcDateTime,
                signingCredentials: creds
            );

            return (new JwtSecurityTokenHandler().WriteToken(token), expiration);
        }
    }
}
