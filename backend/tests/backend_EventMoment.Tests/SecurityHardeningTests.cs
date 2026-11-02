using System.Security.Claims;
using backend_EventMoment.Data;
using backend_EventMoment.Dtos.User;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using backend_EventMoment.Services.Email;
using backend_EventMoment.Services.Exceptions;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

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
        ["Frontend:AdminUrl"] = "https://admin.example.com",
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

    private static (AdminAccountService service, AdminDbContext context, AdminAccount admin, IDataProtectionProvider dataProtection, FakeEmailSender email) AdminSetup()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var dataProtection = new EphemeralDataProtectionProvider();
        var email = new FakeEmailSender();
        var config = Config();
        var admin = new AdminAccount
        {
            Id = Guid.NewGuid(), Email = "boss@tbfmoment.com", FullName = "Boss", Role = AdminRole.Superadmin,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminPass123"), IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.AdminAccounts.Add(admin);
        context.SaveChanges();
        var service = new AdminAccountService(
            context,
            new JwtService(config),
            dataProtection,
            email,
            config,
            NullLogger<AdminAccountService>.Instance,
            new LoginThrottle(new MemoryCache(new MemoryCacheOptions())));
        return (service, context, admin, dataProtection, email);
    }

    [Fact]
    public async Task AdminLogin_RequiresValidMfaBeforeIssuingAdminSession()
    {
        var (service, context, admin, dataProtection, _) = AdminSetup();
        const string secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
        context.AdminMfas.Add(new AdminMfa
        {
            AdminId = admin.Id,
            SecretProtected = dataProtection.CreateProtector("AdminMfa.Secret.v1").Protect(secret),
            EnabledAt = DateTimeOffset.UtcNow,
        });
        await context.SaveChangesAsync();

        var challenge = await service.LoginAsync(new LoginDto { Email = "boss@tbfmoment.com", Password = "AdminPass123" });

        Assert.True(challenge.MfaRequired);
        Assert.False(challenge.MfaSetupRequired);
        Assert.False(string.IsNullOrWhiteSpace(challenge.MfaToken));
        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var challengeClaims = handler.ReadJwtToken(challenge.MfaToken).Claims;
        Assert.Contains(challengeClaims, claim => claim.Type == "type" && claim.Value == "admin_mfa");
        Assert.DoesNotContain(challengeClaims, claim => claim.Type == ClaimTypes.Email);

        var code = Totp.Code(secret, Totp.CurrentStep(DateTimeOffset.UtcNow));
        var session = await service.CompleteMfaLoginAsync(new AdminMfaLoginDto
        {
            MfaToken = challenge.MfaToken!,
            Code = code,
        });

        Assert.False(string.IsNullOrWhiteSpace(session.Token));
        Assert.True(session.Expiration > DateTimeOffset.UtcNow);
        var claims = handler.ReadJwtToken(session.Token).Claims;
        Assert.Contains(claims, claim => claim.Type == "type" && claim.Value == "admin");
        Assert.Contains(claims, claim => claim.Type == ClaimTypes.Email && claim.Value == admin.Email);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CompleteMfaLoginAsync(new AdminMfaLoginDto { MfaToken = challenge.MfaToken!, Code = code }));
    }

    [Fact]
    public async Task AdminLogin_RequiresFirstTotpCodeToEnableMfa()
    {
        var (service, context, admin, _, _) = AdminSetup();

        var challenge = await service.LoginAsync(new LoginDto { Email = admin.Email, Password = "AdminPass123" });

        Assert.True(challenge.MfaRequired);
        Assert.True(challenge.MfaSetupRequired);
        Assert.NotNull(challenge.OtpAuthUri);
        Assert.False(string.IsNullOrWhiteSpace(challenge.MfaSecret));
        Assert.Null((await context.AdminMfas.FindAsync(admin.Id))!.EnabledAt);

        var code = Totp.Code(challenge.MfaSecret!, Totp.CurrentStep(DateTimeOffset.UtcNow));
        var session = await service.CompleteMfaLoginAsync(new AdminMfaLoginDto
        {
            MfaToken = challenge.MfaToken!,
            Code = code,
        });

        Assert.False(string.IsNullOrWhiteSpace(session.Token));
        Assert.NotNull((await context.AdminMfas.FindAsync(admin.Id))!.EnabledAt);
    }

    [Fact]
    public async Task MfaRecovery_SendsSingleUseEmailLinkAndResetsMfa()
    {
        var (service, context, admin, dataProtection, email) = AdminSetup();
        context.AdminMfas.Add(new AdminMfa
        {
            AdminId = admin.Id,
            SecretProtected = dataProtection.CreateProtector("AdminMfa.Secret.v1")
                .Protect(Totp.GenerateSecret()),
            EnabledAt = DateTimeOffset.UtcNow,
        });
        await context.SaveChangesAsync();

        await service.RequestMfaRecoveryAsync(admin.Email);

        var sent = Assert.Single(email.Sent);
        Assert.Equal(admin.Email, sent.To);
        Assert.Contains("/admin/recuperation-mfa#token=", sent.Body);
        var token = System.Text.RegularExpressions.Regex.Match(sent.Body, @"#token=([^""&]+)").Groups[1].Value;
        Assert.False(string.IsNullOrWhiteSpace(token));
        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        Assert.Equal("admin_mfa_recovery", handler.ReadJwtToken(Uri.UnescapeDataString(token)).Claims
            .First(c => c.Type == "type").Value);

        await service.CompleteMfaRecoveryAsync(new AdminMfaRecoveryDto { Token = Uri.UnescapeDataString(token) });

        Assert.Null(await context.AdminMfas.FindAsync(admin.Id));
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CompleteMfaRecoveryAsync(new AdminMfaRecoveryDto { Token = Uri.UnescapeDataString(token) }));
    }

    [Fact]
    public async Task MfaRecovery_DoesNotSendEmailForUnknownOrUnconfiguredAccounts()
    {
        var (service, context, admin, _, email) = AdminSetup();

        await service.RequestMfaRecoveryAsync("unknown@example.com");
        await service.RequestMfaRecoveryAsync(admin.Email);

        Assert.Empty(email.Sent);
        Assert.Empty(await context.AdminMfas.ToListAsync());
    }

    [Fact]
    public async Task AdminLogin_RejectsInvalidPassword()
    {
        var (service, _, _, _, _) = AdminSetup();
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
