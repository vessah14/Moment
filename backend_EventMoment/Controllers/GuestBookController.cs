using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/guest-book")]
    [Authorize]
    public class GuestBookController : ControllerBase
    {
        private readonly IGuestBookService _service;

        public GuestBookController(IGuestBookService service)
        {
            _service = service;
        }

        [HttpPost("~/api/public/events/{slug}/guest-book")]
        [AllowAnonymous]
        [EnableRateLimiting("public-write")]
        public async Task<IActionResult> CreatePublic(string slug, [FromBody] CreateGuestBookEntryDto dto)
        {
            return await _service.CreatePublicAsync(slug, dto) ? Accepted() : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromQuery] Guid eventId, [FromBody] CreateGuestBookEntryDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.CreateAsync(dto, eventId, organizerId);
            return CreatedAtAction(nameof(GetAll), new { eventId }, result);
        }

        [HttpGet("event/{eventId:guid}")]
        public async Task<IActionResult> GetAll(Guid eventId)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.GetAllAsync(eventId, organizerId);
            return Ok(result);
        }

        [HttpPut("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateGuestBookStatusDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.UpdateStatusAsync(id, dto, organizerId);
            return Ok(result);
        }

        [HttpPut("{id:guid}/reply")]
        public async Task<IActionResult> Reply(Guid id, [FromBody] ReplyGuestBookEntryDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.ReplyAsync(id, dto, organizerId);
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
