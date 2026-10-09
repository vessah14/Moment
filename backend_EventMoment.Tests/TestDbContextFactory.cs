using System.Security.Claims;
using backend_EventMoment.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Tests;

// Fournit un AdminDbContext sur une base EF Core InMemory (une base isolée par appel),
// avec un IHttpContextAccessor simulé pour piloter CurrentOrganizerId : c'est ce champ
// que AdminDbContext.OnModelCreating utilise dans ses HasQueryFilter(...) pour isoler
// les données par organisateur. Passer organizerId: null simule une requête anonyme
// (CurrentOrganizerId == Guid.Empty), exactement comme les endpoints publics.
public static class TestDbContextFactory
{
    // databaseName : permet de partager la même base InMemory entre AdminDbContext et
    // SignupDbContext, comme en production où les deux rôles pointent sur la même base.
    public static AdminDbContext CreateAdminContext(Guid? organizerId = null, string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<AdminDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;

        var httpContext = new DefaultHttpContext();
        if (organizerId.HasValue)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, organizerId.Value.ToString()),
                new("type", "organizer"),
            };
            httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));
        }

        var accessor = new HttpContextAccessor { HttpContext = httpContext };
        return new AdminDbContext(options, accessor);
    }
}
