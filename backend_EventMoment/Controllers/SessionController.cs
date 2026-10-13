using backend_EventMoment.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend_EventMoment.Controllers
{
    // Déconnexion (organisateurs et administrateurs) : le jeton présenté est révoqué
    // immédiatement, il ne peut plus servir même s'il a été copié.
    [ApiController]
    [Authorize]
    public class SessionController(SessionRevocations revocations) : ControllerBase
    {
        [HttpPost("api/session/logout")]
        public IActionResult Logout()
        {
            var jti = User.FindFirst("jti")?.Value;
            var exp = User.FindFirst("exp")?.Value;
            if (!string.IsNullOrEmpty(jti) && long.TryParse(exp, out var seconds))
                revocations.Revoke(jti, DateTimeOffset.FromUnixTimeSeconds(seconds));
            return NoContent();
        }
    }
}
