using backend_EventMoment.Data;
using backend_EventMoment.Dtos.User;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace backend_EventMoment.Tests;

public class UserServiceTests
{
    private static SignupDbContext CreateSignupContext(string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<SignupDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;
        return new SignupDbContext(options);
    }

    private static IConfiguration CreateConfig() => new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "unit-test-signing-key-at-least-32-bytes-long!",
            ["Jwt:Issuer"] = "backend_EventMoment",
            ["Jwt:Audience"] = "backend_EventMoment_users",
            ["Jwt:ExpiresInMinutes"] = "30",
            ["Frontend:BaseUrl"] = "http://localhost:5173",
        })
        .Build();

    private static (UserService service, AdminDbContext adminContext, FakeEmailSender emailSender, JwtService jwt) CreateService()
    {
        var config = CreateConfig();
        var adminContext = TestDbContextFactory.CreateAdminContext();
        var signupContext = CreateSignupContext();
        var jwt = new JwtService(config);
        var emailSender = new FakeEmailSender();
        var facebookAuth = new FakeFacebookAuthService();
        var service = new UserService(adminContext, signupContext, jwt, emailSender, config, facebookAuth);
        return (service, adminContext, emailSender, jwt);
    }

    private static Utilisateur SeedOrganizer(AdminDbContext context, string email = "user@example.com", string password = "Password1", bool verified = true)
    {
        var user = new Utilisateur
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FullName = "Test User",
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Organizers.Add(user);
        // Connexion par mot de passe réservée aux adresses confirmées.
        if (verified)
            context.OrganizerEmailVerifications.Add(new OrganizerEmailVerification { OrganizerId = user.Id, VerifiedAt = DateTimeOffset.UtcNow });
        context.SaveChanges();
        return user;
    }

    [Fact]
    public async Task RequestPasswordResetAsync_SendsEmail_ForKnownActiveUser()
    {
        var (service, adminContext, emailSender, _) = CreateService();
        var user = SeedOrganizer(adminContext);

        await service.RequestPasswordResetAsync(new DemanderResetPasswordDto { Email = user.Email });

        Assert.Single(emailSender.Sent);
        Assert.Equal(user.Email, emailSender.Sent[0].To);
        Assert.Contains("token=", emailSender.Sent[0].Body);
    }

    [Fact]
    public async Task RequestPasswordResetAsync_DoesNothing_ForUnknownEmail()
    {
        var (service, _, emailSender, _) = CreateService();

        await service.RequestPasswordResetAsync(new DemanderResetPasswordDto { Email = "ghost@example.com" });

        Assert.Empty(emailSender.Sent);
    }

    [Fact]
    public async Task ResetPasswordAsync_UpdatesPasswordHash_WithValidToken()
    {
        var (service, adminContext, _, jwt) = CreateService();
        var user = SeedOrganizer(adminContext);
        var (token, _) = jwt.GeneratePasswordResetToken(user);
        var oldHash = user.PasswordHash;

        await service.ResetPasswordAsync(new ResetPasswordDto
        {
            Token = token,
            NewPassword = "NewPassword1",
            ConfirmPassword = "NewPassword1",
        });

        var updated = await adminContext.Organizers.IgnoreQueryFilters().FirstAsync(u => u.Id == user.Id);
        Assert.NotEqual(oldHash, updated.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify("NewPassword1", updated.PasswordHash));
    }

    [Fact]
    public async Task ResetPasswordAsync_RejectsReusedToken()
    {
        var (service, adminContext, _, jwt) = CreateService();
        var user = SeedOrganizer(adminContext);
        var (token, _) = jwt.GeneratePasswordResetToken(user);

        await service.ResetPasswordAsync(new ResetPasswordDto
        {
            Token = token,
            NewPassword = "NewPassword1",
            ConfirmPassword = "NewPassword1",
        });

        // Le même jeton, utilisé une seconde fois, doit être refusé : le premier
        // reset a changé UpdatedAt, donc le "session_version" embarqué dans le
        // jeton ne correspond plus à la version en base.
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ResetPasswordAsync(new ResetPasswordDto
        {
            Token = token,
            NewPassword = "AnotherPassword1",
            ConfirmPassword = "AnotherPassword1",
        }));
    }

    [Fact]
    public async Task ResetPasswordAsync_RejectsInvalidToken()
    {
        var (service, adminContext, _, _) = CreateService();
        SeedOrganizer(adminContext);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ResetPasswordAsync(new ResetPasswordDto
        {
            Token = "not-a-real-token",
            NewPassword = "NewPassword1",
            ConfirmPassword = "NewPassword1",
        }));
    }

    [Fact]
    public async Task LoginAsync_ThrowsForWrongPassword()
    {
        var (service, adminContext, _, _) = CreateService();
        var user = SeedOrganizer(adminContext, password: "CorrectPassword1");

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.LoginAsync(new LoginDto
        {
            Email = user.Email,
            Password = "WrongPassword",
        }));
    }

    [Fact]
    public async Task LoginAsync_ThrowsForInactiveAccount()
    {
        var (service, adminContext, _, _) = CreateService();
        var user = SeedOrganizer(adminContext, password: "CorrectPassword1");
        user.IsActive = false;
        adminContext.SaveChanges();

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.LoginAsync(new LoginDto
        {
            Email = user.Email,
            Password = "CorrectPassword1",
        }));
    }

    [Fact]
    public async Task LoginAsync_ReturnsToken_ForValidCredentials()
    {
        var (service, adminContext, _, _) = CreateService();
        var user = SeedOrganizer(adminContext, password: "CorrectPassword1");

        var result = await service.LoginAsync(new LoginDto { Email = user.Email, Password = "CorrectPassword1" });

        Assert.False(string.IsNullOrWhiteSpace(result.Token));
        Assert.True(result.Expiration > DateTimeOffset.UtcNow);
    }

    // La connexion Facebook ne peut pas être vérifiée de bout en bout sans une vraie
    // application Facebook Developer : ces tests couvrent donc directement la logique de
    // rattachement/création de compte, en simulant la vérification du jeton via
    // FakeFacebookAuthService (le point qui, en production, parle réellement à l'API Graph).

    [Fact]
    public async Task LoginWithFacebookAsync_CreatesNewOrganizer_WhenNoExistingAccount()
    {
        var config = CreateConfig();
        var adminContext = TestDbContextFactory.CreateAdminContext();
        var signupContext = CreateSignupContext();
        var jwt = new JwtService(config);
        var facebookAuth = new FakeFacebookAuthService { Result = ("fb-sub-1", "newuser@example.com", "Awa Diop") };
        var service = new UserService(adminContext, signupContext, jwt, new FakeEmailSender(), config, facebookAuth);

        var result = await service.LoginWithFacebookAsync(new FacebookAuthDto { AccessToken = "whatever" });

        Assert.False(string.IsNullOrWhiteSpace(result.Token));
        var created = await signupContext.Organizers.SingleAsync(o => o.Email == "newuser@example.com");
        Assert.Equal("Awa Diop", created.FullName);
        var link = await signupContext.ExternalLogins.SingleAsync(x => x.Provider == "facebook" && x.ProviderUserId == "fb-sub-1");
        Assert.Equal(created.Id, link.OrganizerId);
    }

    [Fact]
    public async Task LoginWithFacebookAsync_LinksExistingAccount_WhenEmailMatches()
    {
        var config = CreateConfig();
        var db = Guid.NewGuid().ToString();
        var adminContext = TestDbContextFactory.CreateAdminContext(databaseName: db);
        var signupContext = CreateSignupContext(db);
        var jwt = new JwtService(config);

        var existing = new Utilisateur
        {
            Id = Guid.NewGuid(),
            Email = "existing@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password1"),
            FullName = "Existing User",
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        signupContext.Organizers.Add(existing);
        signupContext.SaveChanges();

        var facebookAuth = new FakeFacebookAuthService { Result = ("fb-sub-2", "existing@example.com", "Existing User") };
        var service = new UserService(adminContext, signupContext, jwt, new FakeEmailSender(), config, facebookAuth);

        await service.LoginWithFacebookAsync(new FacebookAuthDto { AccessToken = "whatever" });

        // Pas de doublon : le compte mot-de-passe existant est réutilisé, pas recréé.
        var matches = await signupContext.Organizers.Where(o => o.Email == "existing@example.com").ToListAsync();
        Assert.Single(matches);
        Assert.Equal(existing.Id, matches[0].Id);
        var link = await signupContext.ExternalLogins.SingleAsync(x => x.Provider == "facebook" && x.ProviderUserId == "fb-sub-2");
        Assert.Equal(existing.Id, link.OrganizerId);
    }

    [Fact]
    public async Task LoginWithFacebookAsync_ReusesLink_OnRepeatLogin()
    {
        var config = CreateConfig();
        var adminContext = TestDbContextFactory.CreateAdminContext();
        var signupContext = CreateSignupContext();
        var jwt = new JwtService(config);
        var facebookAuth = new FakeFacebookAuthService { Result = ("fb-sub-3", "repeat@example.com", "Repeat User") };
        var service = new UserService(adminContext, signupContext, jwt, new FakeEmailSender(), config, facebookAuth);

        await service.LoginWithFacebookAsync(new FacebookAuthDto { AccessToken = "first" });
        await service.LoginWithFacebookAsync(new FacebookAuthDto { AccessToken = "second" });

        Assert.Single(await signupContext.Organizers.Where(o => o.Email == "repeat@example.com").ToListAsync());
        Assert.Single(await signupContext.ExternalLogins.Where(x => x.Provider == "facebook" && x.ProviderUserId == "fb-sub-3").ToListAsync());
    }

    [Fact]
    public async Task LoginWithFacebookAsync_Throws_WhenNoEmailProvided()
    {
        var config = CreateConfig();
        var adminContext = TestDbContextFactory.CreateAdminContext();
        var signupContext = CreateSignupContext();
        var jwt = new JwtService(config);
        var facebookAuth = new FakeFacebookAuthService { Result = ("fb-sub-4", null, "No Email User") };
        var service = new UserService(adminContext, signupContext, jwt, new FakeEmailSender(), config, facebookAuth);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.LoginWithFacebookAsync(new FacebookAuthDto { AccessToken = "whatever" }));
    }

    [Fact]
    public async Task LoginWithFacebookAsync_Throws_WhenTokenValidationFails()
    {
        var (service, _, _, _) = CreateService();

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.LoginWithFacebookAsync(new FacebookAuthDto { AccessToken = "not-a-real-token" }));
    }
}
