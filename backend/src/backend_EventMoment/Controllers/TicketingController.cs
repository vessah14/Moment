using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/ticketing")]
    [Authorize]
    public class TicketingController : ControllerBase
    {
        private readonly ITicketingService _service;

        public TicketingController(ITicketingService service)
        {
            _service = service;
        }

        [HttpPost("types")]
        public async Task<IActionResult> CreateType([FromQuery] Guid eventId, [FromBody] CreateTicketTypeDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.CreateTypeAsync(dto, eventId, organizerId);
            return Ok(result);
        }

        [HttpGet("types/event/{eventId:guid}")]
        public async Task<IActionResult> GetTypes(Guid eventId)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.GetTypesAsync(eventId, organizerId);
            return Ok(result);
        }

        [HttpDelete("types/{id:guid}")]
        public async Task<IActionResult> DeleteType(Guid id)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var success = await _service.DeleteTypeAsync(id, organizerId);
            return success ? NoContent() : NotFound();
        }

        [HttpPost("types/{ticketTypeId:guid}/sales")]
        public async Task<IActionResult> RecordSale(Guid ticketTypeId, [FromBody] RecordTicketSaleDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.RecordSaleAsync(ticketTypeId, dto, organizerId);
            return Ok(result);
        }

        [HttpGet("sales/event/{eventId:guid}")]
        public async Task<IActionResult> GetSales(Guid eventId)
        {
            if (!TryGetOrganizerId(out var organizerId))
                return Unauthorized();

            var result = await _service.GetSalesAsync(eventId, organizerId);
            return Ok(result);
        }

        private bool TryGetOrganizerId(out Guid organizerId)
        {
            organizerId = Guid.Empty;
            return User.FindFirst("type")?.Value == "organizer"
                && Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId);
        }
    }
}
