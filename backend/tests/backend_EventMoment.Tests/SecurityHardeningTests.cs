using System.Security.Claims;
using backend_EventMoment.Data;
using backend_EventMoment.Dtos.User;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using backend_EventMoment.Services.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;

namespace backend_EventMoment.Tests;

// Durcissement : connexion admin, blocage des comptes, déconnexion.
public class SecurityHardeningTests
{
    private static IConfiguration Config() => new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
    {
        ["Jwt:Key"] = "unit-test-signing-key-at-least-32-bytes-long!",
        ["Jwt:Issuer"] = "backend_EventMoment",
        ["Jwt:Audience"] = "backend_EventMoment_users",
        ["Jwt:ExpiresInMinutes"] = "30",
    }).Build();

    [Fact]
    public void Totp_MatchesRfc6238ReferenceVector()
    {
        // RFC 6238, secret ASCII « 12345678901234567890 », t = 59 s → 94287082 (8 chiffres).
        const string secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
        Assert.Equal("287082", Totp.Code(secret, Totp.CurrentStep(DateTimeOffset.FromUnixTimeSeconds(59))));
    }

    [Fact]
    public void Totp_RejectsReplayedOrWrongCodes()
    {
        var secret = Totp.GenerateSecret();
        var now = DateTimeOffset.UtcNow;
        var code = Totp.Code(secret, Totp.CurrentStep(now));

        var step = Totp.Verify(secret, code, 0, now);
        Assert.NotNull(step);
        Assert.Null(Totp.Verify(secret, code, step!.Value, now)); // rejeu refusé
        Assert.Null(Totp.Verify(secret, "000000" == code ? "111111" : "000000", 0, now));
        Assert.Null(Totp.Verify(secret, "12345", 0, now));
    }

    private static (AdminAccountService service, AdminDbContext context, AdminAccount admin) AdminSetup()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var admin = new AdminAccount
        {
            Id = Guid.NewGuid(), Email = "boss@tbfmoment.com", FullName = "Boss", Role = AdminRole.Superadmin,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminPass123"), IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.AdminAccounts.Add(admin);
        context.SaveChanges();
        var service = new AdminAccountService(context, new JwtService(Config()), new LoginThrottle(new MemoryCache(new MemoryCacheOptions())));
        return (service, context, admin);
    }

    [Fact]
    public async Task AdminLogin_ReturnsSessionDirectly_EvenWhenLegacyMfaIsEnabled()
    {
        var (service, context, admin) = AdminSetup();
        context.AdminMfas.Add(new AdminMfa
        {
            AdminId = admin.Id,
            SecretProtected = "legacy-secret",
            EnabledAt = DateTimeOffset.UtcNow,
        });
        await context.SaveChangesAsync();

        var session = await service.LoginAsync(new LoginDto { Email = "boss@tbfmoment.com", Password = "AdminPass123" });

        Assert.False(string.IsNullOrWhiteSpace(session.Token));
        Assert.True(session.Expiration > DateTimeOffset.UtcNow);
        var claims = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().ReadJwtToken(session.Token).Claims;
        Assert.Contains(claims, claim => claim.Type == "type" && claim.Value == "admin");
        Assert.Contains(claims, claim => claim.Type == ClaimTypes.Email && claim.Value == admin.Email);
    }

    [Fact]
    public async Task AdminLogin_RejectsInvalidPassword()
    {
        var (service, _, _) = AdminSetup();
        await Assert.ThrowsAsync<InvalidCredentialsException>(() =>
            service.LoginAsync(new LoginDto { Email = "boss@tbfmoment.com", Password = "WrongPassword123" }));
    }

    [Fact]
    public async Task OrganizerLogin_LocksAccountAfterTenFailures_EvenWithTheRightPassword()
    {
        var db = Guid.NewGuid().ToString();
        var admin = TestDbContextFactory.CreateAdminContext(databaseName: db);
        var signup = new SignupDbContext(new Microsoft.EntityFrameworkCore.DbContextOptionsBuilder<SignupDbContext>()
            .UseInMemoryDatabase(db).Options);
        var user = new Utilisateur
        {
            Id = Guid.NewGuid(), Email = "victim@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("RightPass1"),
            FullName = "Victime", IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        signup.Organizers.Add(user);
        signup.SaveChanges();
        admin.OrganizerEmailVerifications.Add(new OrganizerEmailVerification { OrganizerId = user.Id, VerifiedAt = DateTimeOffset.UtcNow });
        admin.SaveChanges();
        var config = Config();
        var service = new UserService(admin, signup, new JwtService(config), new FakeEmailSender(), config,
            new FakeFacebookAuthService(), null, new LoginThrottle(new MemoryCache(new MemoryCacheOptions())));

        for (var i = 0; i < 10; i++)
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.LoginAsync(new LoginDto { Email = "victim@example.com", Password = "WrongPass" + i }));

        var locked = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.LoginAsync(new LoginDto { Email = "victim@example.com", Password = "RightPass1" }));
        Assert.Equal(LoginThrottle.LockedMessage, locked.Message);

        // Même message pour une adresse inconnue : rien n'est révélé.
        for (var i = 0; i < 10; i++)
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.LoginAsync(new LoginDto { Email = "ghost@example.com", Password = "x" + i }));
        var ghost = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.LoginAsync(new LoginDto { Email = "ghost@example.com", Password = "x" }));
        Assert.Equal(LoginThrottle.LockedMessage, ghost.Message);
    }

    [Fact]
    public void Logout_RevokesTheSessionUntilItExpires()
    {
        var revocations = new SessionRevocations(new MemoryCache(new MemoryCacheOptions()));
        revocations.Revoke("abc", DateTimeOffset.UtcNow.AddMinutes(20));
        revocations.Revoke("old", DateTimeOffset.UtcNow.AddMinutes(-1));

        Assert.True(revocations.IsRevoked("abc"));
        Assert.False(revocations.IsRevoked("old"));
        Assert.False(revocations.IsRevoked("other"));
        Assert.False(revocations.IsRevoked(null));
    }

    [Fact]
    public void SessionTokens_CarryAUniqueIdentifier()
    {
        var jwt = new JwtService(Config());
        var user = new Utilisateur { Id = Guid.NewGuid(), Email = "a@b.c", UpdatedAt = DateTimeOffset.UtcNow };
        var (t1, _) = jwt.GenerateOrganizerToken(user);
        var (t2, _) = jwt.GenerateOrganizerToken(user);
        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var j1 = handler.ReadJwtToken(t1).Id;
        Assert.False(string.IsNullOrEmpty(j1));
        Assert.NotEqual(j1, handler.ReadJwtToken(t2).Id);
    }
}
