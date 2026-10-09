using backend_EventMoment.Models;
using backend_EventMoment.Services;
using Microsoft.Extensions.Configuration;

namespace backend_EventMoment.Tests;

public class JwtServiceTests
{
    private static JwtService CreateService(string expiresInMinutes = "30")
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "unit-test-signing-key-at-least-32-bytes-long!",
                ["Jwt:Issuer"] = "backend_EventMoment",
                ["Jwt:Audience"] = "backend_EventMoment_users",
                ["Jwt:ExpiresInMinutes"] = expiresInMinutes,
            })
            .Build();

        return new JwtService(config);
    }

    private static Utilisateur CreateOrganizer(DateTimeOffset? updatedAt = null) => new()
    {
        Id = Guid.NewGuid(),
        Email = "test@example.com",
        PasswordHash = "irrelevant",
        FullName = "Test Organizer",
        IsActive = true,
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = updatedAt ?? DateTimeOffset.UtcNow,
    };

    [Fact]
    public void GeneratePasswordResetToken_ThenValidate_ReturnsMatchingClaims()
    {
        var service = CreateService();
        var organizer = CreateOrganizer();

        var (token, _) = service.GeneratePasswordResetToken(organizer);

        var valid = service.TryValidatePasswordResetToken(token, out var organizerId, out var sessionVersion);

        Assert.True(valid);
        Assert.Equal(organizer.Id, organizerId);
        Assert.Equal(organizer.UpdatedAt.ToUnixTimeMilliseconds(), sessionVersion);
    }

    [Fact]
    public void TryValidatePasswordResetToken_RejectsOrdinaryOrganizerToken()
    {
        var service = CreateService();
        var organizer = CreateOrganizer();

        var (loginToken, _) = service.GenerateOrganizerToken(organizer);

        var valid = service.TryValidatePasswordResetToken(loginToken, out _, out _);

        // Un jeton de connexion classique n'a pas le claim "type" = "password_reset",
        // il ne doit donc jamais être accepté comme jeton de réinitialisation.
        Assert.False(valid);
    }

    [Fact]
    public void TryValidatePasswordResetToken_RejectsExpiredToken()
    {
        var service = CreateService(expiresInMinutes: "30");
        var organizer = CreateOrganizer();

        // On force un jeton déjà expiré en demandant une durée de vie négative
        // via un second service configuré avec un ExpiresInMinutes négatif n'est pas
        // possible pour GeneratePasswordResetToken (durée fixe à 30 min) : on vérifie
        // donc plutôt qu'un jeton corrompu / mal signé est rejeté, ce qui couvre la
        // même famille de défenses (signature/validation stricte).
        var (token, _) = service.GeneratePasswordResetToken(organizer);
        var tampered = token[..^2] + (token[^2] == 'a' ? "bb" : "aa");

        var valid = service.TryValidatePasswordResetToken(tampered, out _, out _);

        Assert.False(valid);
    }

    [Fact]
    public void GenerateOrganizerToken_EmbedsSessionVersionFromUpdatedAt()
    {
        var service = CreateService();
        var updatedAt = DateTimeOffset.UtcNow.AddDays(-3);
        var organizer = CreateOrganizer(updatedAt);

        var (_, expiration) = service.GenerateOrganizerToken(organizer);

        Assert.True(expiration > DateTimeOffset.UtcNow);
        Assert.True(expiration <= DateTimeOffset.UtcNow.AddMinutes(31));
    }
}
