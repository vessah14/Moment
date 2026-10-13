using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/guests")]
    [Authorize]
    public class GuestsController : ControllerBase
    {
        private readonly IGuestService _service;

        public GuestsController(IGuestService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromQuery] Guid eventId, [FromQuery] Guid? groupId, [FromBody] CreateGuestDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.CreateAsync(dto, eventId, organizerId, groupId);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // Envoie (ou renvoie) le lien d'invitation par e-mail à cet invité.
        [HttpPost("{id:guid}/invitation")]
        public async Task<IActionResult> SendInvitation(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();
            return Ok(await _service.QueueInvitationAsync(id, organizerId));
        }

        // Envoie le lien à tous les invités de l'événement qui ne l'ont pas encore reçu.
        [HttpPost("invitations")]
        public async Task<IActionResult> SendPendingInvitations([FromQuery] Guid eventId)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();
            return Ok(new { queued = await _service.QueuePendingInvitationsAsync(eventId, organizerId) });
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
        public async Task<IActionResult> GetAll([FromQuery] Guid? eventId = null)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.GetAllAsync(organizerId, eventId);
            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGuestDto dto)
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

        [HttpPost("{id:guid}/check-in")]
        public async Task<IActionResult> CheckIn(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            return Ok(await _service.CheckInAsync(id, organizerId));
        }

        [HttpDelete("{id:guid}/check-in")]
        public async Task<IActionResult> UndoCheckIn(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            return Ok(await _service.UndoCheckInAsync(id, organizerId));
        }

        [HttpGet("~/api/public/invitations/{guestId:guid}")]
        [AllowAnonymous]
        [EnableRateLimiting("public-browse")]
        public async Task<IActionResult> GetPublicInvitation(Guid guestId)
        {
            var result = await _service.GetPublicInvitationAsync(guestId);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost("~/api/public/invitations/{guestId:guid}/rsvp")]
        [AllowAnonymous]
        [EnableRateLimiting("public-write")]
        public async Task<IActionResult> SubmitPublicRsvp(Guid guestId, [FromBody] SubmitPublicRsvpDto dto)
        {
            var result = await _service.SubmitPublicRsvpAsync(guestId, dto);
            return result == null ? NotFound() : Ok(result);
        }

        private bool TryGetOrganizerId(out Guid organizerId)
        {
            organizerId = Guid.Empty;
            return User.FindFirst("type")?.Value == "organizer"
                && Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId);
        }
    }
}
