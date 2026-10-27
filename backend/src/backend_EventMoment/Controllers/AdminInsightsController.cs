using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend_EventMoment.Dtos;
using backend_EventMoment.Services;

namespace backend_EventMoment.Controllers
{
    // Console superadmin : graphiques d'activité, fiche organisation et gestion de son offre.
    // Les actions (POST) sont tracées dans le journal d'activité admin (Program.cs).
    [ApiController]
    [Route("api/admin/platform")]
    [Authorize(Policy = "SuperadminOnly")]
    public class AdminInsightsController : ControllerBase
    {
        private readonly AdminInsightsService _insights;

        public AdminInsightsController(AdminInsightsService insights)
        {
            _insights = insights;
        }

        [HttpGet("timeseries")]
        public async Task<IActionResult> GetTimeSeries([FromQuery] int days = 30, CancellationToken cancellationToken = default) =>
            Ok(await _insights.GetTimeSeriesAsync(days, cancellationToken));

        [HttpGet("organizations/{id:guid}")]
        public async Task<IActionResult> GetOrganization(Guid id, CancellationToken cancellationToken)
        {
            var result = await _insights.GetOrganizationAsync(id, cancellationToken);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost("organizations/{id:guid}/plan")]
        public async Task<IActionResult> GrantPlan(Guid id, [FromBody] AdminGrantPlanDto dto, CancellationToken cancellationToken)
        {
            await _insights.GrantPlanAsync(id, dto, cancellationToken);
            return Ok(await _insights.GetOrganizationAsync(id, cancellationToken));
        }

        [HttpPost("organizations/{id:guid}/plan/revoke")]
        public async Task<IActionResult> RevokePlan(Guid id, CancellationToken cancellationToken)
        {
            await _insights.RevokePlanAsync(id, cancellationToken);
            return Ok(await _insights.GetOrganizationAsync(id, cancellationToken));
        }
    }
}
