using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    public class PublicSiteController : ControllerBase
    {
        private readonly IPublicSiteService _service;
        private readonly IEventStatsService _stats;

        public PublicSiteController(IPublicSiteService service, IEventStatsService stats)
        {
            _service = service;
            _stats = stats;
        }

        // Statistiques du site public : { "type": "visit" } à l'ouverture, { "type": "share" }
        // quand un visiteur partage le lien.
        [HttpPost("api/public/events/{slug}/track")]
        [AllowAnonymous]
        [EnableRateLimiting("public-track")]
        public async Task<IActionResult> Track(string slug, [FromBody] TrackEventDto dto)
        {
            EventStatKind? kind = dto.Type switch
            {
                "visit" => EventStatKind.Visit,
                "share" => EventStatKind.Share,
                _ => null
            };
            if (kind == null || slug.Length > 200) return BadRequest();
            return await _stats.RecordAsync(slug, kind.Value) ? NoContent() : NotFound();
        }

        public class TrackEventDto
        {
            public string? Type { get; set; }
        }

        [HttpGet("api/public/events/{slug}/site")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicSite(string slug)
        {
            var result = await _service.GetPublicSiteAsync(slug);
            return result == null ? NotFound() : Ok(result);
        }
    }
}
