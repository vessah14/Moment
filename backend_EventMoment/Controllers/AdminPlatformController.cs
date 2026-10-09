using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Services;

namespace backend_EventMoment.Controllers
{
    // Vues transverses pour la console superadmin : listent des données sur
    // TOUS les organisateurs de la plateforme, jamais un seul. Réservé au rôle
    // Superadmin — un compte "support" n'y a pas accès.
    [ApiController]
    [Route("api/admin/platform")]
    [Authorize(Policy = "SuperadminOnly")]
    public class AdminPlatformController : ControllerBase
    {
        private readonly IAdminPlatformService _service;
        private readonly IPlanService _plans;
        private readonly IReviewService _reviews;

        public AdminPlatformController(IAdminPlatformService service, IPlanService plans, IReviewService reviews)
        {
            _service = service;
            _plans = plans;
            _reviews = reviews;
        }

        [HttpGet("organizations")]
        public async Task<IActionResult> GetOrganizations()
        {
            return Ok(await _service.GetOrganizationsAsync());
        }

        [HttpPatch("organizations/{id:guid}/status")]
        public async Task<IActionResult> UpdateOrganizationStatus(Guid id, [FromBody] UpdateOrganizationStatusDto dto)
        {
            return Ok(await _service.UpdateOrganizationStatusAsync(id, dto));
        }

        [HttpGet("events")]
        public async Task<IActionResult> GetEvents()
        {
            return Ok(await _service.GetEventsAsync());
        }

        [HttpPatch("events/{id:guid}/suspension")]
        public async Task<IActionResult> UpdateEventSuspension(Guid id, [FromBody] UpdateEventSuspensionDto dto)
        {
            if (!Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var adminId))
                return Unauthorized();
            return Ok(await _service.UpdateEventSuspensionAsync(id, dto, adminId));
        }

        [HttpGet("moderation")]
        public async Task<IActionResult> GetModerationQueue()
        {
            return Ok(await _service.GetModerationQueueAsync());
        }

        [HttpPost("moderation/guestbook/{id:guid}/resolve")]
        public async Task<IActionResult> ResolveGuestBookModeration(Guid id, [FromQuery] bool keep)
        {
            await _service.ResolveGuestBookModerationAsync(id, keep);
            return NoContent();
        }

        [HttpPost("moderation/gallery/{id:guid}/resolve")]
        public async Task<IActionResult> ResolveGalleryModeration(Guid id, [FromQuery] bool keep)
        {
            await _service.ResolveGalleryModerationAsync(id, keep);
            return NoContent();
        }

        // Demandes de passage à une offre payante (paiement reçu hors ligne).
        [HttpGet("upgrade-requests")]
        public async Task<IActionResult> GetUpgradeRequests() => Ok(await _plans.ListRequestsAsync());

        [HttpPost("upgrade-requests/{id:guid}/approve")]
        public async Task<IActionResult> ApproveUpgradeRequest(Guid id, [FromBody] HandleUpgradeRequestDto dto)
        {
            if (!Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var adminId))
                return Unauthorized();
            return Ok(await _plans.ApproveAsync(id, adminId, dto.Note));
        }

        [HttpPost("upgrade-requests/{id:guid}/reject")]
        public async Task<IActionResult> RejectUpgradeRequest(Guid id, [FromBody] HandleUpgradeRequestDto dto)
        {
            if (!Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var adminId))
                return Unauthorized();
            return Ok(await _plans.RejectAsync(id, adminId, dto.Note));
        }

        // Avis des clients sur la plateforme.
        [HttpGet("reviews")]
        public async Task<IActionResult> GetReviews() => Ok(await _reviews.ListAsync());

        [HttpPatch("reviews/{id:guid}/status")]
        public async Task<IActionResult> UpdateReviewStatus(Guid id, [FromBody] UpdateReviewStatusDto dto) =>
            Ok(await _reviews.SetStatusAsync(id, dto.Status));

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            return Ok(await _service.GetTransactionsAsync());
        }
    }
}
