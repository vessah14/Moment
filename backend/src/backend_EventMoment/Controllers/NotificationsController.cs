using System.Security.Claims;
using backend_EventMoment.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly IInAppNotificationService _service;

        public NotificationsController(IInAppNotificationService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _service.GetAsync(organizerId));
        }

        [HttpPut("{id:guid}/read")]
        public async Task<IActionResult> MarkRead(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return await _service.MarkReadAsync(id, organizerId) ? NoContent() : NotFound();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return await _service.DeleteAsync(id, organizerId) ? NoContent() : NotFound();
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllRead()
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(new { count = await _service.MarkAllReadAsync(organizerId) });
        }

        private bool TryGetOrganizerId(out Guid organizerId)
        {
            organizerId = Guid.Empty;
            return User.FindFirst("type")?.Value == "organizer"
                && Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId);
        }
    }
}
