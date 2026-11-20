using backend_EventMoment.Data;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace backend_EventMoment.Tests;

// Chaque notification du tableau de bord part aussi par e-mail à l'organisateur.
public class NotificationEmailTests
{
    private static (InAppNotificationService Service, FakeEmailSender Email, AdminDbContext Context, Guid EventId, Guid OrganizerId) Setup()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        context.Organizers.Add(new Utilisateur
        {
            Id = organizerId, Email = "orga@example.com", PasswordHash = "x", FullName = "Awa",
            IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        });
        var evt = new Event
        {
            Id = Guid.NewGuid(), OrganizerId = organizerId, CategoryId = Guid.NewGuid(), Name = "Mariage d'Awa",
            Slug = $"evt-{Guid.NewGuid():N}", Status = EventStatus.Publie, CustomFields = "{}",
            CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Events.Add(evt);
        context.SaveChanges();

        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Frontend:BaseUrl"] = "https://tbfmoment.example",
        }).Build();
        var email = new FakeEmailSender();
        var notifier = new OrganizerNotifier(context, email, config, NullLogger<OrganizerNotifier>.Instance);
        var service = new InAppNotificationService(context, NullLogger<InAppNotificationService>.Instance, notifier);
        return (service, email, context, evt.Id, organizerId);
    }

    [Fact]
    public async Task GiftReservation_IsShownInDashboardAndEmailed()
    {
        var (service, email, _, eventId, organizerId) = Setup();

        await service.NotifyGiftReservedAsync(eventId, "Machine à café", "Moussa <b>");

        Assert.Single((await service.GetAsync(organizerId)).Items);
        var sent = Assert.Single(email.Sent);
        Assert.Equal("orga@example.com", sent.To);
        Assert.Contains("Un cadeau a été réservé", sent.Subject);
        Assert.Contains("Mariage d'Awa", sent.Subject);
        Assert.Contains("https://tbfmoment.example/dashboard/liste-mariage", sent.Body);
        Assert.Contains("Moussa &lt;b&gt;", sent.Body);
    }

    [Fact]
    public async Task PhotoEnRouteAndCampaign_AllSendAnEmail()
    {
        var (service, email, _, eventId, _) = Setup();

        await service.NotifyGuestPhotoAsync(eventId, "Fatou");
        await service.NotifyGuestEnRouteAsync(eventId, "Ibrahim");
        await service.NotifyCampaignSentAsync(eventId, "Rappel J-7", 12, 15, null);

        Assert.Equal(3, email.Sent.Count);
    }

    [Fact]
    public async Task DisabledPreference_KeepsDashboardNotificationButSkipsEmail()
    {
        var (service, email, context, eventId, organizerId) = Setup();
        context.OrganizerNotificationSettings.Add(new OrganizerNotificationSettings { OrganizerId = organizerId, Payments = false });
        await context.SaveChangesAsync();

        await service.NotifyGiftReservedAsync(eventId, "Machine à café", "Moussa");

        Assert.Single((await service.GetAsync(organizerId)).Items);
        Assert.Empty(email.Sent);
    }

    [Fact]
    public async Task RsvpAndGuestbook_AreNotEmailedTwice()
    {
        // Ces deux notifications ont déjà leur propre e-mail, envoyé par le service métier.
        var (service, email, _, eventId, _) = Setup();

        await service.NotifyRsvpAsync(eventId, "Awa", true, 1);
        await service.NotifyGuestbookAsync(eventId, "Awa");

        Assert.Empty(email.Sent);
    }
}
