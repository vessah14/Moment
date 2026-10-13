using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/conference")]
    [Authorize]
    public class ConferenceController : ControllerBase
    {
        private readonly IConferenceService _service;

        public ConferenceController(IConferenceService service)
        {
            _service = service;
        }

        [HttpPost("speakers")]
        public async Task<IActionResult> CreateSpeaker([FromQuery] Guid eventId, [FromBody] CreateSpeakerDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _service.CreateSpeakerAsync(dto, eventId, organizerId));
        }

        [HttpGet("speakers/event/{eventId:guid}")]
        public async Task<IActionResult> GetSpeakers(Guid eventId)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _service.GetSpeakersAsync(eventId, organizerId));
        }

        [HttpDelete("speakers/{id:guid}")]
        public async Task<IActionResult> DeleteSpeaker(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return await _service.DeleteSpeakerAsync(id, organizerId) ? NoContent() : NotFound();
        }

        [HttpPost("sessions")]
        public async Task<IActionResult> CreateSession([FromQuery] Guid eventId, [FromBody] CreateConferenceSessionDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _service.CreateSessionAsync(dto, eventId, organizerId));
        }

        [HttpGet("sessions/event/{eventId:guid}")]
        public async Task<IActionResult> GetSessions(Guid eventId)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _service.GetSessionsAsync(eventId, organizerId));
        }

        [HttpDelete("sessions/{id:guid}")]
        public async Task<IActionResult> DeleteSession(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return await _service.DeleteSessionAsync(id, organizerId) ? NoContent() : NotFound();
        }

        [HttpPost("sponsors")]
        public async Task<IActionResult> CreateSponsor([FromQuery] Guid eventId, [FromBody] CreateSponsorDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _service.CreateSponsorAsync(dto, eventId, organizerId));
        }

        [HttpGet("sponsors/event/{eventId:guid}")]
        public async Task<IActionResult> GetSponsors(Guid eventId)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _service.GetSponsorsAsync(eventId, organizerId));
        }

        [HttpDelete("sponsors/{id:guid}")]
        public async Task<IActionResult> DeleteSponsor(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return await _service.DeleteSponsorAsync(id, organizerId) ? NoContent() : NotFound();
        }

        private bool TryGetOrganizerId(out Guid organizerId)
        {
            organizerId = Guid.Empty;
            return User.FindFirst("type")?.Value == "organizer"
                && Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId);
        }
    }
}
