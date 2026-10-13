using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/seating")]
    [Authorize]
    public class SeatingController : ControllerBase
    {
        private readonly ISeatingService _service;

        public SeatingController(ISeatingService service)
        {
            _service = service;
        }

        [HttpPost("tables")]
        public async Task<IActionResult> CreateTable([FromQuery] Guid eventId, [FromBody] CreateEventTableDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.CreateTableAsync(dto, eventId, organizerId);
            return Ok(result);
        }

        [HttpGet("tables/event/{eventId:guid}")]
        public async Task<IActionResult> GetTables(Guid eventId)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.GetTablesAsync(eventId, organizerId);
            return Ok(result);
        }

        [HttpDelete("tables/{id:guid}")]
        public async Task<IActionResult> DeleteTable(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var success = await _service.DeleteTableAsync(id, organizerId);
            return success ? NoContent() : NotFound();
        }

        [HttpPost("assignments")]
        public async Task<IActionResult> AssignGuest([FromQuery] Guid eventId, [FromBody] CreateSeatingAssignmentDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.AssignGuestAsync(dto, eventId, organizerId);
            return Ok(result);
        }

        [HttpGet("assignments/event/{eventId:guid}")]
        public async Task<IActionResult> GetAssignments(Guid eventId)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.GetAssignmentsAsync(eventId, organizerId);
            return Ok(result);
        }

        [HttpDelete("assignments/guest/{guestId:guid}")]
        public async Task<IActionResult> UnassignGuest(Guid guestId)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var success = await _service.UnassignGuestAsync(guestId, organizerId);
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
