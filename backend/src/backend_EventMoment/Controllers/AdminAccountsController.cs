using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend_EventMoment.Dtos.User;
using backend_EventMoment.Services.Exceptions;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/admin/accounts")]
    [Authorize]
    public class AdminAccountsController : ControllerBase
    {
        private readonly IAdminAccountService _service;

        public AdminAccountsController(IAdminAccountService service)
        {
            _service = service;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        [EnableRateLimiting("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            try
            {
                var result = await _service.LoginAsync(dto);
                return Ok(result);
            }
            catch (InvalidCredentialsException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
            catch (AccountInactiveException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Policy = "SuperadminOnly")]
        public async Task<IActionResult> Create(CreateAdminAccountDto dto)
        {
            var currentAdminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            try
            {
                var result = await _service.CreateAsync(dto, currentAdminId);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (EmailAlreadyExistsException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "SuperadminOnly")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet]
        [Authorize(Policy = "SuperadminOnly")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // Nettoyage d'une ancienne configuration MFA.
        [HttpDelete("{id}/mfa")]
        [Authorize(Policy = "SuperadminOnly")]
        public async Task<IActionResult> ResetMfa(Guid id)
        {
            if (!Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var currentAdminId))
                return Unauthorized();
            return await _service.ResetMfaAsync(id, currentAdminId) ? NoContent() : NotFound();
        }

        [HttpPatch("{id}/deactivate")]
        [Authorize(Policy = "SuperadminOnly")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            if (!Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var currentAdminId))
                return Unauthorized();

            var success = await _service.DeactivateAsync(id, currentAdminId);
            return success ? NoContent() : NotFound();
        }
    }
}
