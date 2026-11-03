using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend_EventMoment.Dtos;
using backend_EventMoment.Dtos.User;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using backend_EventMoment.Services;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private const long MaxProfilePhotoSizeBytes = 5 * 1024 * 1024;
        private static readonly HashSet<string> AllowedProfilePhotoExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp"
        };
        private readonly IUserService _service;
        private readonly INotificationSettingsService _notificationSettings;

        public UsersController(IUserService service, INotificationSettingsService notificationSettings)
        {
            _service = service;
            _notificationSettings = notificationSettings;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        [EnableRateLimiting("public-write")]
        public async Task<IActionResult> Register([FromBody] CreateUtilisateurDtos dto)
        {
            await _service.RegisterAsync(dto);
            // Réponse identique que l'adresse soit nouvelle ou déjà inscrite (anti-énumération).
            return Accepted(new { message = "Vérifiez votre boîte e-mail pour activer votre compte." });
        }

        [HttpPost("resend-verification")]
        [AllowAnonymous]
        [EnableRateLimiting("login")]
        public async Task<IActionResult> ResendVerificationByEmail([FromBody] DemanderResetPasswordDto dto)
        {
            await _service.ResendVerificationByEmailAsync(dto.Email);
            return NoContent();
        }

        [HttpPost("login")]
        [AllowAnonymous]
        [EnableRateLimiting("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _service.LoginAsync(dto);
            return Ok(result);
        }

        [HttpPost("oauth/google")]
        [AllowAnonymous]
        [EnableRateLimiting("login")]
        public async Task<IActionResult> LoginWithGoogle([FromBody] GoogleAuthDto dto)
        {
            var result = await _service.LoginWithGoogleAsync(dto);
            return Ok(result);
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        [EnableRateLimiting("login")]
        public async Task<IActionResult> ForgotPassword([FromBody] DemanderResetPasswordDto dto)
        {
            await _service.RequestPasswordResetAsync(dto);
            // Réponse identique que l'e-mail existe ou non (anti-énumération).
            return NoContent();
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        [EnableRateLimiting("login")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            await _service.ResetPasswordAsync(dto);
            return NoContent();
        }

        [HttpPost("verify-email")]
        [AllowAnonymous]
        [EnableRateLimiting("login")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
        {
            var result = await _service.VerifyEmailAsync(dto);
            return Ok(result);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            DateTimeOffset? authTime = long.TryParse(User.FindFirst(JwtService.AuthTimeClaim)?.Value, out var seconds)
                ? DateTimeOffset.FromUnixTimeSeconds(seconds)
                : null;
            var result = await _service.RefreshTokenAsync(organizerId, authTime);
            return result == null
                ? Unauthorized(new { error = "Session expirée : reconnectez-vous." })
                : Ok(result);
        }

        [HttpPost("me/resend-verification")]
        [EnableRateLimiting("login")]
        public async Task<IActionResult> ResendVerification()
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            await _service.ResendVerificationEmailAsync(organizerId);
            return NoContent();
        }

        [HttpGet("me/notification-settings")]
        public async Task<IActionResult> GetNotificationSettings()
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _notificationSettings.GetAsync(organizerId));
        }

        [HttpPut("me/notification-settings")]
        public async Task<IActionResult> UpdateNotificationSettings([FromBody] NotificationSettingsDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _notificationSettings.UpdateAsync(organizerId, dto));
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            if (!IsSelfOrSuperadmin(id)) return Forbid();

            var result = await _service.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet]
        [Authorize(Policy = "SuperadminOnly")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUtilisateurDtos dto)
        {
            if (!IsSelfOrSuperadmin(id)) return Forbid();

            var result = await _service.UpdateAsync(id, dto);
            return Ok(result);
        }

        [HttpPost("{id:guid}/profile-photo")]
        [RequestSizeLimit(MaxProfilePhotoSizeBytes + 64 * 1024)]
        public async Task<IActionResult> UpdateProfilePhoto(Guid id, [FromForm] IFormFile file)
        {
            if (!IsSelfOrSuperadmin(id)) return Forbid();
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "Aucun fichier fourni." });

            if (file.Length > MaxProfilePhotoSizeBytes)
                return BadRequest(new { error = "La photo ne peut pas dépasser 5 Mo." });

            var extension = Path.GetExtension(file.FileName);
            if (!AllowedProfilePhotoExtensions.Contains(extension))
                return BadRequest(new { error = "Format non supporté (JPG, PNG, WebP uniquement)." });

            if (!await ImageFileValidator.HasValidSignatureAsync(file, extension))
                return BadRequest(new { error = "Le contenu du fichier ne correspond pas à une image valide." });

            file = await ImageMetadataStripper.StripAsync(file, extension);
            var result = await _service.UpdateProfilePhotoAsync(id, file);
            return Ok(result);
        }

        [HttpPost("{id:guid}/change-password")]
        public async Task<IActionResult> ChangePassword(Guid id, [FromBody] ChangePasswordDto dto)
        {
            if (!IsSelfOrSuperadmin(id)) return Forbid();

            await _service.ChangePasswordAsync(id, dto);
            return NoContent();
        }

        [HttpPatch("{id:guid}/deactivate")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            if (!IsSelfOrSuperadmin(id)) return Forbid();

            var success = await _service.DeactivateAsync(id);
            return success ? NoContent() : NotFound();
        }

        private bool TryGetOrganizerId(out Guid organizerId)
        {
            organizerId = Guid.Empty;
            return User.FindFirst("type")?.Value == "organizer"
                && Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId);
        }

        private bool IsSelfOrSuperadmin(Guid id)
        {
            var currentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(currentId, out var parsed) && parsed == id)
                return true;

            return User.FindFirst(ClaimTypes.Role)?.Value == AdminRole.Superadmin.ToString();
        }
    }
}
