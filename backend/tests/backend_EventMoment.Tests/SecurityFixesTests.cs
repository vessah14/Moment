using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Dtos.User;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using backend_EventMoment.Services.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using System.Net;

namespace backend_EventMoment.Tests;

// Tests des correctifs de l'audit de sécurité du 2026-09-29 et des nouveaux modèles
// (modération, vérification d'e-mail, notifications, rappels automatiques).
public class SecurityFixesTests
{
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

    private static SignupDbContext CreateSignupContext(string databaseName) =>
        new(new DbContextOptionsBuilder<SignupDbContext>().UseInMemoryDatabase(databaseName).Options);

    private static (Utilisateur organizer, Event evt) SeedEvent(AdminDbContext context, EventStatus status = EventStatus.Publie, Guid? organizerId = null)
    {
        var organizer = new Utilisateur
        {
            Id = organizerId ?? Guid.NewGuid(),
            Email = "organizer@example.com",
            PasswordHash = "hash",
            FullName = "Organizer",
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        var category = new Event_categorie
        {
            Id = Guid.NewGuid(),
            Code = "mariage",
            Label = "Mariage",
            Is_active = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdateAt = DateTimeOffset.UtcNow,
        };
        var evt = new Event
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizer.Id,
            CategoryId = category.Id,
            Name = "Mariage de Test",
            Slug = "mariage-" + Guid.NewGuid(),
            Status = status,
            EventDate = new DateOnly(2027, 3, 14),
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Organizers.Add(organizer);
        context.EventCategories.Add(category);
        context.Events.Add(evt);
        context.SaveChanges();
        return (organizer, evt);
    }

    private static Guest SeedGuest(AdminDbContext context, Guid eventId, string fullName = "Invité Test", string email = "guest@example.com")
    {
        var guest = new Guest
        {
            Id = Guid.NewGuid(),
            EventId = eventId,
            FullName = fullName,
            Email = email,
            Status = GuestStatus.EnAttente,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Guests.Add(guest);
        context.SaveChanges();
        return guest;
    }

    private static void Suspend(AdminDbContext context, Guid eventId)
    {
        context.EventModerations.Add(new EventModeration { EventId = eventId, Reason = "Contenu signalé", SuspendedAt = DateTimeOffset.UtcNow });
        context.SaveChanges();
    }

    // ---------------------------------------------------------------- Modération

    [Fact]
    public async Task PublicInvitation_IsHidden_WhenEventIsSuspended()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (_, evt) = SeedEvent(context);
        var guest = SeedGuest(context, evt.Id);
        Suspend(context, evt.Id);

        var result = await new GuestService(context).GetPublicInvitationAsync(guest.Id);

        Assert.Null(result);
    }

    [Fact]
    public async Task Organizer_CannotRepublish_SuspendedEvent()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var (_, evt) = SeedEvent(context, EventStatus.Archive, organizerId);
        Suspend(context, evt.Id);
        var service = new EventService(context);

        var dto = new UpdateEventDto { Name = evt.Name, CategoryId = evt.CategoryId, Status = EventStatus.Publie };

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.UpdateAsync(evt.Id, dto, organizerId));
        Assert.Contains("suspendu", ex.Message);
    }

    [Fact]
    public async Task Organizer_SeesSuspensionFlag_OnOwnEvent()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var (_, evt) = SeedEvent(context, EventStatus.Publie, organizerId);
        Suspend(context, evt.Id);

        var dto = await new EventService(context).GetByIdAsync(evt.Id, organizerId);

        Assert.True(dto.IsSuspended);
        Assert.Equal("Contenu signalé", dto.SuspensionReason);
    }

    // ---------------------------------------------------------------- Vérification e-mail / pré-détournement

    private static (UserService service, AdminDbContext admin, SignupDbContext signup, FakeEmailSender email) CreateUserService(
        FakeFacebookAuthService? facebook = null)
    {
        var db = Guid.NewGuid().ToString();
        var admin = TestDbContextFactory.CreateAdminContext(databaseName: db);
        var signup = CreateSignupContext(db);
        var email = new FakeEmailSender();
        var config = CreateConfig();
        var service = new UserService(admin, signup, new JwtService(config), email, config, facebook ?? new FakeFacebookAuthService());
        return (service, admin, signup, email);
    }

    private static Utilisateur SeedPasswordAccount(SignupDbContext signup, string email, string password)
    {
        var user = new Utilisateur
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FullName = "Compte mot de passe",
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow.AddMinutes(-5),
        };
        signup.Organizers.Add(user);
        signup.SaveChanges();
        return user;
    }

    [Fact]
    public async Task FacebookLogin_OnUnverifiedAccount_RevokesSquatterPassword()
    {
        // Un attaquant s'inscrit avec l'adresse de la victime (jamais vérifiée)...
        var facebook = new FakeFacebookAuthService { Result = ("fb-victim", "victim@example.com", "Victime") };
        var (service, admin, signup, _) = CreateUserService(facebook);
        SeedPasswordAccount(signup, "victim@example.com", "AttackerPass1");

        // En base, app_signup n'a que SELECT/INSERT sur organizers : toute mise à jour d'un
        // compte via SignupDbContext échouerait (« droit refusé »). On reproduit cette règle.
        signup.SavingChanges += (_, _) =>
        {
            if (signup.ChangeTracker.Entries<Utilisateur>().Any(e => e.State == EntityState.Modified))
                throw new InvalidOperationException("app_signup ne peut pas modifier organizers.");
        };

        // ...puis la vraie propriétaire se connecte avec Facebook.
        var result = await service.LoginWithFacebookAsync(new FacebookAuthDto { AccessToken = "x" });

        Assert.False(string.IsNullOrWhiteSpace(result.Token));
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.LoginAsync(new LoginDto { Email = "victim@example.com", Password = "AttackerPass1" }));
        Assert.True(await admin.OrganizerEmailVerifications.AnyAsync());
    }

    [Fact]
    public async Task FacebookLogin_OnVerifiedAccount_KeepsExistingPassword()
    {
        var facebook = new FakeFacebookAuthService { Result = ("fb-owner", "owner@example.com", "Owner") };
        var (service, admin, signup, _) = CreateUserService(facebook);
        var user = SeedPasswordAccount(signup, "owner@example.com", "OwnerPass1");
        admin.OrganizerEmailVerifications.Add(new OrganizerEmailVerification { OrganizerId = user.Id, VerifiedAt = DateTimeOffset.UtcNow });
        admin.SaveChanges();

        await service.LoginWithFacebookAsync(new FacebookAuthDto { AccessToken = "x" });

        var login = await service.LoginAsync(new LoginDto { Email = "owner@example.com", Password = "OwnerPass1" });
        Assert.False(string.IsNullOrWhiteSpace(login.Token));
    }

    [Fact]
    public async Task Login_SameMessage_ForUnknownEmailAndWrongPassword()
    {
        var (service, admin, signup, _) = CreateUserService();
        var user = SeedPasswordAccount(signup, "known@example.com", "RightPass1");
        admin.OrganizerEmailVerifications.Add(new OrganizerEmailVerification { OrganizerId = user.Id, VerifiedAt = DateTimeOffset.UtcNow });
        admin.SaveChanges();

        var unknown = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.LoginAsync(new LoginDto { Email = "nobody@example.com", Password = "RightPass1" }));
        var wrong = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.LoginAsync(new LoginDto { Email = "known@example.com", Password = "WrongPass1" }));

        Assert.Equal("E-mail ou mot de passe incorrect.", unknown.Message);
        Assert.Equal(unknown.Message, wrong.Message);
    }

    [Fact]
    public async Task Login_RequiresConfirmedEmail_AndResendsTheLink()
    {
        var (service, _, signup, email) = CreateUserService();
        SeedPasswordAccount(signup, "pending@example.com", "RightPass1");

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.LoginAsync(new LoginDto { Email = "pending@example.com", Password = "RightPass1" }));

        Assert.Equal(UserService.EmailNotVerifiedMessage, ex.Message);
        var mail = Assert.Single(email.Sent);
        Assert.Contains("verifier-email?token=", mail.Body);
    }

    [Fact]
    public async Task Register_WithExistingEmail_RevealsNothing_AndWarnsTheOwner()
    {
        var (service, admin, signup, email) = CreateUserService();
        var owner = SeedPasswordAccount(signup, "owner@example.com", "OwnerPass1");
        admin.OrganizerEmailVerifications.Add(new OrganizerEmailVerification { OrganizerId = owner.Id, VerifiedAt = DateTimeOffset.UtcNow });
        admin.SaveChanges();

        // Même comportement qu'une inscription réussie : pas d'exception.
        await service.RegisterAsync(new CreateUtilisateurDtos
        {
            FullName = "Imposteur", Email = "owner@example.com", Password = "OtherPass1", ConfirmPassword = "OtherPass1",
        });

        Assert.Single(signup.Organizers);
        var mail = Assert.Single(email.Sent);
        Assert.Equal("owner@example.com", mail.To);
        Assert.Contains("déjà un compte", mail.Body);
        var login = await service.LoginAsync(new LoginDto { Email = "owner@example.com", Password = "OwnerPass1" });
        Assert.False(string.IsNullOrWhiteSpace(login.Token));
    }

    [Fact]
    public async Task RefreshToken_RefusedAfterMaximumSessionLifetime()
    {
        var (service, _, signup, _) = CreateUserService();
        var user = SeedPasswordAccount(signup, "session@example.com", "RightPass1");

        Assert.NotNull(await service.RefreshTokenAsync(user.Id, DateTimeOffset.UtcNow.AddHours(-1)));
        Assert.Null(await service.RefreshTokenAsync(user.Id, DateTimeOffset.UtcNow.AddHours(-13)));
    }

    [Fact]
    public async Task VerifyEmail_WithLinkFromSignupEmail_MarksAccountVerified()
    {
        var (service, _, signup, email) = CreateUserService();

        await service.RegisterAsync(new CreateUtilisateurDtos
        {
            FullName = "Nouvel Organisateur",
            Email = "new@example.com",
            Password = "Password1",
            ConfirmPassword = "Password1",
        });
        var created = (await service.GetByIdAsync(Assert.Single(signup.Organizers).Id))!;
        Assert.False(created.EmailVerified);

        var mail = Assert.Single(email.Sent);
        var token = Uri.UnescapeDataString(System.Text.RegularExpressions.Regex.Match(mail.Body, "token=([^\"]+)").Groups[1].Value);

        await service.VerifyEmailAsync(new VerifyEmailDto { Token = token });

        var reloaded = await service.GetByIdAsync(created.Id);
        Assert.True(reloaded!.EmailVerified);
    }

    [Fact]
    public async Task VerifyEmail_RejectsPasswordResetToken()
    {
        var (service, _, signup, _) = CreateUserService();
        var user = SeedPasswordAccount(signup, "someone@example.com", "Password1");
        var (resetToken, _) = new JwtService(CreateConfig()).GeneratePasswordResetToken(user);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.VerifyEmailAsync(new VerifyEmailDto { Token = resetToken }));
    }

    // ---------------------------------------------------------------- Campagnes

    [Fact]
    public async Task Campaign_EscapesOrganizerHtml_ButKeepsInvitationLink()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var (_, evt) = SeedEvent(context, EventStatus.Publie, organizerId);
        var guest = SeedGuest(context, evt.Id, "Awa Diop");
        var email = new FakeEmailSender();
        var service = new CampaignService(context, email, CreateConfig(), NullLogger<CampaignService>.Instance);

        await service.CreateAsync(new CreateCampaignDto
        {
            Name = "Invitation",
            Channel = "E-mail",
            Audience = "Tous les invités",
            Body = "Bonjour {prénom}\n<form action=\"https://evil.example\"><input name=pwd></form>\n{lien}",
            SendNow = true,
        }, evt.Id, organizerId);

        var body = Assert.Single(email.Sent).Body;
        Assert.DoesNotContain("<form", body);
        Assert.Contains("&lt;form", body);
        Assert.Contains("Bonjour Awa", body);
        Assert.Contains($"<a href=\"http://localhost:5173/invitation/{guest.Id}\" style=", body);
    }

    [Fact]
    public async Task Campaign_PassesEventOrganizerAsReplyTo()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var (organizer, evt) = SeedEvent(context, EventStatus.Publie, organizerId);
        SeedGuest(context, evt.Id);
        var email = new OrganizerRecordingEmailSender();
        var service = new CampaignService(context, email, CreateConfig(), NullLogger<CampaignService>.Instance);

        await service.CreateAsync(new CreateCampaignDto
        {
            Name = "Invitation",
            Channel = "E-mail",
            Audience = "Tous les invités",
            Body = "Bonjour {prénom}",
            SendNow = true,
        }, evt.Id, organizerId);

        var sent = Assert.Single(email.SentForOrganizer);
        Assert.Equal(organizer.Email, sent.OrganizerEmail);
        Assert.Equal(organizer.FullName, sent.OrganizerName);
    }

    [Fact]
    public async Task Campaign_ReturnsSafeMessageForProviderAuthorizationFailure()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var (_, evt) = SeedEvent(context, EventStatus.Publie, organizerId);
        SeedGuest(context, evt.Id);
        var service = new CampaignService(context, new UnauthorizedEmailSender(), CreateConfig(), NullLogger<CampaignService>.Instance);

        var result = await service.CreateAsync(new CreateCampaignDto
        {
            Name = "Invitation",
            Channel = "E-mail",
            Audience = "Tous les invités",
            Body = "Bonjour {prénom}",
            SendNow = true,
        }, evt.Id, organizerId);

        Assert.Equal(0, result.EmailsSentCount);
        Assert.Contains("HTTP 401", result.DeliveryError);
        Assert.DoesNotContain("unit-test", result.DeliveryError);
    }

    [Fact]
    public async Task Campaign_DraftCanBeEditedAndSent_ButNotOnceSent()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var (_, evt) = SeedEvent(context, EventStatus.Publie, organizerId);
        SeedGuest(context, evt.Id);
        var email = new OrganizerRecordingEmailSender();
        var service = new CampaignService(context, email, CreateConfig(), NullLogger<CampaignService>.Instance);
        var draft = await service.CreateAsync(new CreateCampaignDto
        {
            Name = "Brouillon", Channel = "E-mail", Audience = "Tous les invités", Body = "Bonjour", SendNow = false,
        }, evt.Id, organizerId);

        var edited = await service.UpdateAsync(draft.Id, new UpdateCampaignDto { Name = "Invitation", Audience = "Tous les invités", Body = "Bonjour {prénom}" }, organizerId);
        Assert.Equal(("Invitation", CampaignStatus.Brouillon), (edited.Name, edited.Status));
        Assert.Empty(email.SentForOrganizer);

        var sent = await service.UpdateAsync(draft.Id, new UpdateCampaignDto { Name = "Invitation", Audience = "Tous les invités", Body = "Bonjour {prénom}", SendNow = true }, organizerId);
        Assert.Equal(CampaignStatus.Envoyee, sent.Status);
        Assert.Single(email.SentForOrganizer);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpdateAsync(draft.Id, new UpdateCampaignDto { Name = "Autre", Audience = "Tous les invités", Body = "x" }, organizerId));
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            service.UpdateAsync(draft.Id, new UpdateCampaignDto { Name = "Pirate", Audience = "Tous les invités", Body = "x" }, Guid.NewGuid()));
    }

    private sealed class OrganizerRecordingEmailSender : IEmailSender, IOrganizerEmailSender
    {
        public List<(string OrganizerEmail, string OrganizerName)> SentForOrganizer { get; } = new();

        public Task<bool> SendAsync(string toEmail, string subject, string htmlBody) => Task.FromResult(false);

        public Task<bool> SendForOrganizerAsync(string toEmail, string subject, string htmlBody, string organizerEmail, string organizerName)
        {
            SentForOrganizer.Add((organizerEmail, organizerName));
            return Task.FromResult(true);
        }
    }

    private sealed class UnauthorizedEmailSender : IEmailSender
    {
        public Task<bool> SendAsync(string toEmail, string subject, string htmlBody) =>
            throw new HttpRequestException("Unauthorized", null, HttpStatusCode.Unauthorized);
    }

    // ---------------------------------------------------------------- Notifications

    [Fact]
    public async Task PublicRsvp_NotifiesOrganizer_UnlessDisabled()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var (organizer, evt) = SeedEvent(context);
        var guest = SeedGuest(context, evt.Id, "Moussa Fall");
        var email = new FakeEmailSender();
        var notifier = new OrganizerNotifier(context, email, CreateConfig(), NullLogger<OrganizerNotifier>.Instance);
        var service = new GuestService(context, notifier);

        await service.SubmitPublicRsvpAsync(guest.Id, new SubmitPublicRsvpDto { Confirmed = true, AccompanyingCount = 1 });

        var mail = Assert.Single(email.Sent);
        Assert.Equal(organizer.Email, mail.To);
        Assert.Contains("Moussa Fall", mail.Body);

        context.OrganizerNotificationSettings.Add(new OrganizerNotificationSettings { OrganizerId = organizer.Id, NewRsvp = false });
        context.SaveChanges();
        await service.SubmitPublicRsvpAsync(guest.Id, new SubmitPublicRsvpDto { Confirmed = false });

        Assert.Single(email.Sent);
    }

    // ---------------------------------------------------------------- Rappels automatiques

    [Theory]
    [InlineData(EventReminderKind.NonRespondents, -8, false)]
    [InlineData(EventReminderKind.NonRespondents, -7, true)]
    [InlineData(EventReminderKind.NonRespondents, 0, false)]
    [InlineData(EventReminderKind.DayBefore, -1, true)]
    [InlineData(EventReminderKind.DayBefore, -2, false)]
    [InlineData(EventReminderKind.ThankYou, 0, false)]
    [InlineData(EventReminderKind.ThankYou, 1, true)]
    [InlineData(EventReminderKind.ThankYou, 8, false)]
    public void Reminder_IsDue_OnlyInsideItsWindow(string kind, int offsetDays, bool expected)
    {
        var eventDate = new DateOnly(2027, 3, 14);
        Assert.Equal(expected, ReminderDispatcher.IsDue(kind, eventDate, eventDate.AddDays(offsetDays)));
    }

    [Fact]
    public async Task EventReminders_DefaultToDisabled_AndCanBeEnabled()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        var (_, evt) = SeedEvent(context, EventStatus.Publie, organizerId);
        var service = new EventReminderService(context);

        var initial = await service.GetAsync(evt.Id, organizerId);
        Assert.Equal(3, initial.Count);
        Assert.All(initial, r => Assert.False(r.Enabled));

        await service.SetEnabledAsync(evt.Id, EventReminderKind.DayBefore, true, organizerId);

        var after = await service.GetAsync(evt.Id, organizerId);
        Assert.True(after.Single(r => r.Kind == EventReminderKind.DayBefore).Enabled);
    }

    [Fact]
    public async Task EventReminders_RejectOtherOrganizersEvent()
    {
        var ownerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(ownerId);
        var (_, evt) = SeedEvent(context, EventStatus.Publie, ownerId);

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            new EventReminderService(context).SetEnabledAsync(evt.Id, EventReminderKind.DayBefore, true, Guid.NewGuid()));
    }
}
