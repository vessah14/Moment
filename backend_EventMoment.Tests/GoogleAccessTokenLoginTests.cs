using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Dtos.User;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace backend_EventMoment.Tests;

public class FakeGoogleAuthService : IGoogleAuthService
{
    public (string Subject, string Email, bool EmailVerified, string? Name)? Result { get; set; }

    public Task<(string Subject, string Email, bool EmailVerified, string? Name)> ValidateAccessTokenAsync(string accessToken) =>
        Result == null
            ? throw new InvalidOperationException("Jeton Google invalide.")
            : Task.FromResult(Result.Value);
}

// Connexion Google par le bouton du site (jeton d'accès vérifié par Google).
public class GoogleAccessTokenLoginTests
{
    private static (UserService service, AdminDbContext admin, SignupDbContext signup) Create(FakeGoogleAuthService google)
    {
        var db = Guid.NewGuid().ToString();
        var admin = TestDbContextFactory.CreateAdminContext(databaseName: db);
        var signup = new SignupDbContext(new DbContextOptionsBuilder<SignupDbContext>().UseInMemoryDatabase(db).Options);
        // Comme en base : app_signup ne peut jamais modifier un compte existant.
        signup.SavingChanges += (_, _) =>
        {
            if (signup.ChangeTracker.Entries<Utilisateur>().Any(e => e.State == EntityState.Modified))
                throw new InvalidOperationException("app_signup ne peut pas modifier organizers.");
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "unit-test-signing-key-at-least-32-bytes-long!",
            ["Jwt:Issuer"] = "backend_EventMoment",
            ["Jwt:Audience"] = "backend_EventMoment_users",
            ["Jwt:ExpiresInMinutes"] = "30",
            ["Frontend:BaseUrl"] = "http://localhost:5173",
        }).Build();
        var service = new UserService(admin, signup, new JwtService(config), new FakeEmailSender(), config,
            new FakeFacebookAuthService(), google);
        return (service, admin, signup);
    }

    [Fact]
    public async Task NewGoogleUser_GetsAVerifiedAccount()
    {
        var google = new FakeGoogleAuthService { Result = ("g-1", "awa@gmail.com", true, "Awa Diop") };
        var (service, admin, signup) = Create(google);

        var result = await service.LoginWithGoogleAsync(new GoogleAuthDto { AccessToken = "token" });

        Assert.False(string.IsNullOrWhiteSpace(result.Token));
        var account = Assert.Single(signup.Organizers);
        Assert.Equal("Awa Diop", account.FullName);
        Assert.True(await admin.OrganizerEmailVerifications.AnyAsync(v => v.OrganizerId == account.Id));
        Assert.Single(signup.ExternalLogins, x => x.Provider == "google" && x.ProviderUserId == "g-1");

        // Deuxième connexion : même compte, pas de doublon.
        await service.LoginWithGoogleAsync(new GoogleAuthDto { AccessToken = "token" });
        Assert.Single(signup.Organizers);
    }

    [Fact]
    public async Task ExistingUnverifiedPasswordAccount_IsLinkedAndKeepsItsEvents()
    {
        var google = new FakeGoogleAuthService { Result = ("g-2", "vessah@gmail.com", true, "Vessah") };
        var (service, admin, signup) = Create(google);
        var existing = new Utilisateur
        {
            Id = Guid.NewGuid(), Email = "vessah@gmail.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldPass123"),
            FullName = "Vessah", IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow.AddDays(-1),
        };
        signup.Organizers.Add(existing);
        signup.SaveChanges();

        var result = await service.LoginWithGoogleAsync(new GoogleAuthDto { AccessToken = "token" });

        Assert.False(string.IsNullOrWhiteSpace(result.Token));
        Assert.Single(signup.Organizers);
        Assert.Single(signup.ExternalLogins, x => x.OrganizerId == existing.Id);
        Assert.True(await admin.OrganizerEmailVerifications.AnyAsync(v => v.OrganizerId == existing.Id));
    }

    [Fact]
    public async Task UnverifiedGoogleEmail_OrInvalidToken_IsRefused()
    {
        var (unverified, _, signupA) = Create(new FakeGoogleAuthService { Result = ("g-3", "x@gmail.com", false, null) });
        await Assert.ThrowsAsync<InvalidOperationException>(() => unverified.LoginWithGoogleAsync(new GoogleAuthDto { AccessToken = "t" }));
        Assert.Empty(signupA.Organizers);

        var (invalid, _, _) = Create(new FakeGoogleAuthService());
        await Assert.ThrowsAsync<InvalidOperationException>(() => invalid.LoginWithGoogleAsync(new GoogleAuthDto { AccessToken = "t" }));
        await Assert.ThrowsAsync<InvalidOperationException>(() => invalid.LoginWithGoogleAsync(new GoogleAuthDto()));
    }
}
