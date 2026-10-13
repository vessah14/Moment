using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/events/{eventId:guid}/stats")]
    [Authorize]
    public class EventStatsController : ControllerBase
    {
        private readonly IEventStatsService _service;

        public EventStatsController(IEventStatsService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetSummary(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var organizerId))
                return Unauthorized();

            var result = await _service.GetSummaryAsync(eventId, organizerId);
            return Ok(result);
        }
    }
}
