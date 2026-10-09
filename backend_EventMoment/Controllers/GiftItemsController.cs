using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/gift-items")]
    [Authorize]
    public class GiftItemsController : ControllerBase
    {
        private readonly IGiftRegistryService _service;

        public GiftItemsController(IGiftRegistryService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromQuery] Guid eventId, [FromBody] CreateGiftItemDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.CreateAsync(dto, eventId, organizerId);
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

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var success = await _service.DeleteAsync(id, organizerId);
            return success ? NoContent() : NotFound();
        }

        [HttpGet("~/api/public/events/{slug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicEvent(string slug)
        {
            var result = await _service.GetPublicEventAsync(slug);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet("~/api/public/events/{slug}/gifts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicGifts(string slug)
        {
            var result = await _service.GetPublicGiftsAsync(slug);
            return Ok(result);
        }

        [HttpPost("~/api/public/gifts/{giftId:guid}/reserve")]
        [AllowAnonymous]
        [EnableRateLimiting("public-write")]
        public async Task<IActionResult> Reserve(Guid giftId, [FromBody] ReserveGiftDto dto)
        {
            var result = await _service.ReserveAsync(giftId, dto);
            return result == null ? Conflict(new { error = "Ce cadeau n'est plus disponible." }) : Ok(result);
        }

        private bool TryGetOrganizerId(out Guid organizerId)
        {
            organizerId = Guid.Empty;
            return User.FindFirst("type")?.Value == "organizer"
                && Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId);
        }
    }
}
