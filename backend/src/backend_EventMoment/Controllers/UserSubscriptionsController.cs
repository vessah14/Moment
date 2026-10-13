using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/user-subscriptions")]
    [Authorize]
    public class UserSubscriptionsController : ControllerBase
    {
        private readonly IUserSubscriptionService _service;

        public UserSubscriptionsController(IUserSubscriptionService service)
        {
            _service = service;
        }

        [HttpPost("subscribe/{planId:guid}")]
        public async Task<IActionResult> Subscribe(Guid planId, [FromBody] SubscribeToPlanDto dto)
        {
            if (!Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var organizerId))
                return Unauthorized();

            var result = await _service.SubscribeAsync(organizerId, planId, dto);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            if (!Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var organizerId))
                return Unauthorized();

            var result = await _service.GetByIdAsync(id, organizerId);
            return Ok(result);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetAll()
        {
            if (!Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var organizerId))
                return Unauthorized();

            var result = await _service.GetAllAsync(organizerId);
            return Ok(result);
        }

        [HttpPut("{id:guid}/change-plan")]
        public async Task<IActionResult> ChangePlan(Guid id, [FromBody] ChangePlanDto dto)
        {
            if (!Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var organizerId))
                return Unauthorized();

            var result = await _service.ChangePlanAsync(id, dto, organizerId);
            return Ok(result);
        }

        [HttpPut("{id:guid}/cancel")]
        public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelSubscriptionDto dto)
        {
            if (!Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var organizerId))
                return Unauthorized();

            var result = await _service.CancelAsync(id, dto, organizerId);
            return Ok(result);
        }
    }
}
