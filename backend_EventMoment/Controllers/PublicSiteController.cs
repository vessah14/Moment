using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    public class PublicSiteController : ControllerBase
    {
        private readonly IPublicSiteService _service;

        public PublicSiteController(IPublicSiteService service)
        {
            _service = service;
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
