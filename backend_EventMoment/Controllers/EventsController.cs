using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Services;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/events")]
    [Authorize]
    public class EventsController : ControllerBase
    {
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp"
        };
        private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 Mo

        private readonly IEventService _service;
        private readonly IUploadStorage _uploads;

        public EventsController(IEventService service, IUploadStorage uploads)
        {
            _service = service;
            _uploads = uploads;
        }

        [HttpPost("{id:guid}/cover-image")]
        [RequestSizeLimit(MaxFileSizeBytes)]
        public Task<IActionResult> UploadCoverImage(Guid id, [FromForm] IFormFile file) =>
            SaveEventImageAsync(id, file, UploadFolder.Covers);

        // Photo d'un bloc du site (ex. "Histoire"), choisie depuis le Builder. L'URL renvoyée
        // est rangée dans le contenu JSON du bloc.
        [HttpPost("{id:guid}/block-image")]
        [RequestSizeLimit(MaxFileSizeBytes)]
        public Task<IActionResult> UploadBlockImage(Guid id, [FromForm] IFormFile file) =>
            SaveEventImageAsync(id, file, UploadFolder.Blocks);

        private async Task<IActionResult> SaveEventImageAsync(Guid id, IFormFile file, UploadFolder folder)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            // Vérifie que l'événement appartient bien à l'organisateur avant d'écrire quoi que ce soit.
            await _service.GetByIdAsync(id, organizerId);

            if (file == null || file.Length == 0)
                return BadRequest(new { error = "Aucun fichier fourni." });

            if (file.Length > MaxFileSizeBytes)
                return BadRequest(new { error = "Fichier trop volumineux (max 10 Mo)." });

            var extension = Path.GetExtension(file.FileName);
            if (!AllowedExtensions.Contains(extension))
                return BadRequest(new { error = "Format non supporté (JPG, PNG, WebP uniquement)." });

            if (!await ImageFileValidator.HasValidSignatureAsync(file, extension))
                return BadRequest(new { error = "Le contenu du fichier ne correspond pas à une image valide." });

            var url = await _uploads.SaveImageAsync(file, folder, id, extension);
            return Ok(new { url });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEventDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.CreateAsync(dto, organizerId);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.GetByIdAsync(id, organizerId);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.GetAllAsync(organizerId);
            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEventDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.UpdateAsync(id, dto, organizerId);
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var success = await _service.DeleteAsync(id, organizerId);
            return success ? NoContent() : NotFound();
        }

        private bool TryGetOrganizerId(out Guid organizerId)
        {
            organizerId = Guid.Empty;
            return User.FindFirst("type")?.Value == "organizer"
                && Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId);
        }
    }
}
