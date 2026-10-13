using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/guest-groups")]
    [Authorize]
    public class GuestGroupsController : ControllerBase
    {
        private readonly IGuestGroupService _service;

        public GuestGroupsController(IGuestGroupService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromQuery] Guid eventId, [FromBody] CreateGuestGroupDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.CreateAsync(dto, eventId, organizerId);
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

        [HttpGet("event/{eventId:guid}")]
        public async Task<IActionResult> GetAll(Guid eventId)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.GetAllAsync(eventId, organizerId);
            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGuestGroupDto dto)
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
