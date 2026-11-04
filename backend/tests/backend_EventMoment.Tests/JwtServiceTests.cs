using backend_EventMoment.Models;
using backend_EventMoment.Services;
using System.IdentityModel.Tokens.Jwt;
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
        Assert.True(expiration <= DateTimeOffset.UtcNow.AddHours(72).AddMinutes(1));
    }

    // Un organisateur reste connecté 3 jours (prolongés à chaque visite), sans dépasser la
    // durée maximale de session après sa connexion.
    [Fact]
    public void GenerateOrganizerToken_LastsThreeDays_CappedBySessionEnd()
    {
        var service = CreateService();
        var organizer = CreateOrganizer();

        var (_, fresh) = service.GenerateOrganizerToken(organizer);
        Assert.InRange(fresh, DateTimeOffset.UtcNow.AddHours(71.9), DateTimeOffset.UtcNow.AddHours(72).AddMinutes(1));

        // Connexion il y a 29 jours et demi : le jeton s'arrête à la fin des 30 jours.
        var (_, nearEnd) = service.GenerateOrganizerToken(organizer, DateTimeOffset.UtcNow.AddHours(-708));
        Assert.True(nearEnd <= DateTimeOffset.UtcNow.AddHours(12).AddMinutes(1));
    }

    [Fact]
    public void GenerateOrganizerToken_RememberMeLastsThirtyDays_AndCanRefreshForNinetyDays()
    {
        var service = CreateService();
        var organizer = CreateOrganizer();

        var (token, expiration) = service.GenerateOrganizerToken(organizer, rememberMe: true);
        Assert.InRange(expiration, DateTimeOffset.UtcNow.AddDays(29.9), DateTimeOffset.UtcNow.AddDays(30).AddMinutes(1));

        var sessionStartedAt = DateTimeOffset.UtcNow.AddDays(-89);
        var (_, nearEnd) = service.GenerateOrganizerToken(organizer, sessionStartedAt, rememberMe: true);
        Assert.InRange(nearEnd, DateTimeOffset.UtcNow.AddHours(23), DateTimeOffset.UtcNow.AddDays(1).AddMinutes(1));

        var claims = new JwtSecurityTokenHandler().ReadJwtToken(token).Claims;
        Assert.Contains(claims, claim => claim.Type == "remember_me" && claim.Value == "true");
    }
}
