using System.Security.Claims;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/events/{eventId:guid}/reminders")]
    [Authorize]
    public class EventRemindersController : ControllerBase
    {
        private readonly IEventReminderService _service;

        public EventRemindersController(IEventReminderService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(Guid eventId)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _service.GetAsync(eventId, organizerId));
        }

        [HttpPut("{kind}")]
        public async Task<IActionResult> Update(Guid eventId, string kind, [FromBody] UpdateEventReminderDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _service.SetEnabledAsync(eventId, kind, dto.Enabled, organizerId));
        }

        private bool TryGetOrganizerId(out Guid organizerId)
        {
            organizerId = Guid.Empty;
            return User.FindFirst("type")?.Value == "organizer"
                && Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId);
        }
    }
}
