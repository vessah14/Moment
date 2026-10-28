using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Services;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/gallery")]
    [Authorize]
    public class GalleryController : ControllerBase
    {
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp", ".gif"
        };
        private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 Mo

        private readonly IGalleryService _service;
        private readonly IEventService _events;
        private readonly IUploadStorage _uploads;
        private readonly IPlanService? _plans;

        public GalleryController(IGalleryService service, IEventService events, IUploadStorage uploads, IPlanService? plans = null)
        {
            _service = service;
            _events = events;
            _uploads = uploads;
            _plans = plans;
        }

        [HttpPost]
        [RequestSizeLimit(MaxFileSizeBytes)]
        public async Task<IActionResult> Upload([FromQuery] Guid eventId, [FromForm] IFormFile file)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            await _events.GetByIdAsync(eventId, organizerId);

            if (file == null || file.Length == 0)
                return BadRequest(new { error = "Aucun fichier fourni." });

            if (file.Length > MaxFileSizeBytes)
                return BadRequest(new { error = "Fichier trop volumineux (max 10 Mo)." });

            var extension = Path.GetExtension(file.FileName);
            if (!AllowedExtensions.Contains(extension))
                return BadRequest(new { error = "Format non supporté (JPG, PNG, WebP, GIF uniquement)." });

            if (!await ImageFileValidator.HasValidSignatureAsync(file, extension))
                return BadRequest(new { error = "Le contenu du fichier ne correspond pas à une image valide." });

            // Propriété de l'événement vérifiée avant tout envoi vers le stockage.
            await _service.GetAllAsync(eventId, organizerId);
            // Nombre de photos limité par l'offre (Free : 20, Premium : 200…), vérifié avant l'envoi.
            if (_plans != null)
                await _plans.EnsureCanAddPhotoAsync(organizerId, eventId);

            // Position GPS, appareil, date… retirés avant l'enregistrement.
            file = await ImageMetadataStripper.StripAsync(file, extension);
            var url = await _uploads.SaveImageAsync(file, UploadFolder.Gallery, eventId, extension);
            try
            {
                var result = await _service.CreateAsync(url, null, eventId, organizerId);
                return Ok(result);
            }
            catch
            {
                await _uploads.DeleteFileAsync(url);
                throw;
            }
        }

        // Album des invités : photo envoyée depuis la page de l'événement, sans compte. Mêmes
        // contrôles que l'envoi de l'organisateur, limite de photos de son offre comprise ;
        // la photo attend sa validation (Galerie du tableau de bord).
        [HttpPost("~/api/public/events/{slug}/photos")]
        [AllowAnonymous]
        [EnableRateLimiting("public-upload")]
        [RequestSizeLimit(MaxFileSizeBytes + 64 * 1024)]
        public async Task<IActionResult> UploadGuestPhoto(string slug, [FromForm] IFormFile file, [FromForm] string? name)
        {
            if (slug.Length > 200) return NotFound();
            var target = await _service.FindGuestUploadEventAsync(slug);
            if (target == null)
                return NotFound(new { error = "L'envoi de photos n'est pas ouvert pour cet événement." });

            if (file == null || file.Length == 0)
                return BadRequest(new { error = "Aucun fichier fourni." });
            if (file.Length > MaxFileSizeBytes)
                return BadRequest(new { error = "Photo trop lourde (10 Mo au plus)." });
            var extension = Path.GetExtension(file.FileName);
            if (!AllowedExtensions.Contains(extension))
                return BadRequest(new { error = "Format non supporté (JPG, PNG, WebP, GIF uniquement)." });
            if (!await ImageFileValidator.HasValidSignatureAsync(file, extension))
                return BadRequest(new { error = "Le contenu du fichier ne correspond pas à une image valide." });

            var (eventId, organizerId) = target.Value;
            if (_plans != null)
                await _plans.EnsureCanAddPhotoAsync(organizerId, eventId);

            file = await ImageMetadataStripper.StripAsync(file, extension);
            var url = await _uploads.SaveImageAsync(file, UploadFolder.Gallery, eventId, extension);
            try
            {
                await _service.CreateGuestPhotoAsync(eventId, url, name);
                return Ok(new { pending = true });
            }
            catch
            {
                await _uploads.DeleteFileAsync(url);
                throw;
            }
        }

        [HttpGet("event/{eventId:guid}")]
        public async Task<IActionResult> GetAll(Guid eventId)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            return Ok(await _service.GetAllAsync(eventId, organizerId));
        }

        [HttpPut("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateGalleryPhotoStatusDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            return Ok(await _service.UpdateStatusAsync(id, dto, organizerId));
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var url = await _service.DeleteAsync(id, organizerId);
            if (url == null)
                return NotFound();

            await _uploads.DeleteFileAsync(url);

            return NoContent();
        }

        private bool TryGetOrganizerId(out Guid organizerId)
        {
            organizerId = Guid.Empty;
            return User.FindFirst("type")?.Value == "organizer"
                && Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId);
        }
    }
}
