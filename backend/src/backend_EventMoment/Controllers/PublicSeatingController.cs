using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    // « Trouver ma place » sur le site public d'un événement.
    [ApiController]
    [AllowAnonymous]
    [EnableRateLimiting("public-read")]
    public class PublicSeatingController : ControllerBase
    {
        private readonly IPublicSeatingService _service;

        public PublicSeatingController(IPublicSeatingService service)
        {
            _service = service;
        }

        [HttpGet("api/public/events/{slug}/seating")]
        public async Task<IActionResult> GetTables(string slug)
        {
            var tables = await _service.GetTablesAsync(slug);
            return tables == null ? NotFound() : Ok(tables);
        }

        [HttpGet("api/public/events/{slug}/seating/find")]
        public async Task<IActionResult> Find(string slug, [FromQuery] string? name)
        {
            if (string.IsNullOrWhiteSpace(name) || name.Length > 150)
                return BadRequest(new { error = "Indiquez votre nom complet." });

            var result = await _service.FindSeatAsync(slug, name);
            return result == null ? NotFound() : Ok(result);
        }
    }
}
