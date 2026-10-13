using System.Security.Claims;
using backend_EventMoment.Dtos;
using backend_EventMoment.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace backend_EventMoment.Controllers
{
    // Espace personnel de l'organisateur connecté : son offre, ses demandes de passage à une
    // offre payante et son avis sur la plateforme. Tout est limité à son propre compte.
    [ApiController]
    [Route("api/me")]
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly IPlanService _plans;
        private readonly IReviewService _reviews;

        public AccountController(IPlanService plans, IReviewService reviews)
        {
            _plans = plans;
            _reviews = reviews;
        }

        [HttpGet("plan")]
        public async Task<IActionResult> GetPlan()
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _plans.GetUsageAsync(organizerId));
        }

        [HttpGet("upgrade-requests/latest")]
        public async Task<IActionResult> GetLatestRequest()
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            var request = await _plans.GetLatestRequestAsync(organizerId);
            return request == null ? NoContent() : Ok(request);
        }

        [HttpPost("upgrade-requests")]
        [EnableRateLimiting("public-write")]
        public async Task<IActionResult> RequestUpgrade([FromBody] CreateUpgradeRequestDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _plans.RequestUpgradeAsync(organizerId, dto));
        }

        [HttpDelete("upgrade-requests/pending")]
        public async Task<IActionResult> CancelPendingRequest()
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return await _plans.CancelPendingRequestAsync(organizerId) ? NoContent() : NotFound();
        }

        [HttpGet("review")]
        public async Task<IActionResult> GetReview()
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            var review = await _reviews.GetMineAsync(organizerId);
            return review == null ? NoContent() : Ok(review);
        }

        [HttpPut("review")]
        [EnableRateLimiting("public-write")]
        public async Task<IActionResult> SaveReview([FromBody] SaveReviewDto dto)
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return Ok(await _reviews.SaveMineAsync(organizerId, dto));
        }

        [HttpDelete("review")]
        public async Task<IActionResult> DeleteReview()
        {
            if (!TryGetOrganizerId(out var organizerId)) return Unauthorized();
            return await _reviews.DeleteMineAsync(organizerId) ? NoContent() : NotFound();
        }

        private bool TryGetOrganizerId(out Guid organizerId)
        {
            organizerId = Guid.Empty;
            return User.FindFirst("type")?.Value == "organizer"
                && Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out organizerId);
        }
    }

    // Avis publiés, affichés sur la page d'accueil.
    [ApiController]
    [AllowAnonymous]
    [EnableRateLimiting("public-read")]
    public class PublicReviewsController : ControllerBase
    {
        private readonly IReviewService _reviews;

        public PublicReviewsController(IReviewService reviews)
        {
            _reviews = reviews;
        }

        [HttpGet("api/public/reviews")]
        public async Task<IActionResult> GetPublished([FromQuery] int limit = 6) =>
            Ok(await _reviews.GetPublishedAsync(limit));
    }
}
