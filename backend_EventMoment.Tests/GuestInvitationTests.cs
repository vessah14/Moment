using backend_EventMoment.Data;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Tests;

// Lien d'invitation envoyé automatiquement aux invités ajoutés (InvitationDispatcher).
public class GuestInvitationTests
{
    private static (AdminDbContext context, Guid organizerId, Guid eventId) Seed()
    {
        var organizerId = Guid.NewGuid();
        var context = TestDbContextFactory.CreateAdminContext(organizerId);
        context.Organizers.Add(new Utilisateur
        {
            Id = organizerId, Email = "org@example.com", PasswordHash = "hash", FullName = "Awa Diop",
            IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        });
        var evt = new Event
        {
            Id = Guid.NewGuid(), OrganizerId = organizerId, CategoryId = Guid.NewGuid(), Name = "Mariage", Slug = "mariage",
            Status = EventStatus.Brouillon, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Events.Add(evt);
        context.SaveChanges();
        return (context, organizerId, evt.Id);
    }

    private static CreateGuestDto Guest(string email, bool send = true) =>
        new() { FullName = "Fatou Ndiaye", Phone = "+237699000010", Email = email, SendInvitation = send };

    [Fact]
    public async Task AddingAGuest_QueuesTheInvitation_UnlessTheOrganizerOptsOut()
    {
        var (context, organizerId, eventId) = Seed();
        var signal = new InvitationSignal();
        var service = new GuestService(context, invitations: signal);

        var invited = await service.CreateAsync(Guest("fatou@example.com"), eventId, organizerId);
        Assert.True(invited.InvitationPending);
        Assert.Null(invited.InvitationSentAt);
        Assert.True(await signal.WaitAsync(TimeSpan.Zero, CancellationToken.None));

        var silent = await service.CreateAsync(Guest("paul@example.com", send: false), eventId, organizerId);
        Assert.False(silent.InvitationPending);
        Assert.Single(context.GuestInvitations);
    }

    [Fact]
    public async Task ChangingTheEmail_SendsTheInvitationAgain()
    {
        var (context, organizerId, eventId) = Seed();
        var service = new GuestService(context);
        var guest = await service.CreateAsync(Guest("fatou@example.com"), eventId, organizerId);
        var invitation = context.GuestInvitations.Single();
        invitation.SentAt = DateTimeOffset.UtcNow.AddDays(-1);
        invitation.Attempts = 1;
        context.SaveChanges();

        var updated = await service.UpdateAsync(guest.Id, new UpdateGuestDto
        {
            FullName = guest.FullName, Phone = guest.Phone, Email = "fatou.new@example.com", Status = GuestStatus.EnAttente,
        }, organizerId);

        Assert.True(updated.InvitationPending);
        Assert.Null(context.GuestInvitations.Single().SentAt);
    }

    [Fact]
    public async Task Resend_RequeuesButRefusesTwoSendsInAFewMinutes()
    {
        var (context, organizerId, eventId) = Seed();
        var service = new GuestService(context);
        var guest = await service.CreateAsync(Guest("fatou@example.com", send: false), eventId, organizerId);

        Assert.True((await service.QueueInvitationAsync(guest.Id, organizerId)).InvitationPending);
        context.GuestInvitations.Single().SentAt = DateTimeOffset.UtcNow;
        context.SaveChanges();
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.QueueInvitationAsync(guest.Id, organizerId));

        // Un autre organisateur ne peut pas déclencher d'envoi.
        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.QueueInvitationAsync(guest.Id, Guid.NewGuid()));
    }

    [Fact]
    public async Task QueuePending_SkipsGuestsAlreadyInvited()
    {
        var (context, organizerId, eventId) = Seed();
        var service = new GuestService(context);
        await service.CreateAsync(Guest("a@example.com", send: false), eventId, organizerId);
        await service.CreateAsync(Guest("b@example.com"), eventId, organizerId);
        var sent = await service.CreateAsync(Guest("c@example.com"), eventId, organizerId);
        context.GuestInvitations.Single(i => i.GuestId == sent.Id).SentAt = DateTimeOffset.UtcNow;
        context.SaveChanges();

        Assert.Equal(2, await service.QueuePendingInvitationsAsync(eventId, organizerId));
        Assert.Equal(3, context.GuestInvitations.Count());
    }

    [Fact]
    public void Email_ContainsThePersonalLink_AndEscapesOrganizerText()
    {
        var (subject, html) = InvitationDispatcher.BuildMessage("Fatou Ndiaye", "Mariage <Awa & Ibrahim>",
            new DateOnly(2027, 3, 14), new TimeOnly(16, 0), "Route des Almadies", "Awa <script>", "https://tbfmoment.com/invitation/abc");

        Assert.Equal("Invitation : Mariage <Awa & Ibrahim>", subject);
        Assert.Contains("Bonjour Fatou,", html);
        Assert.Contains("href=\"https://tbfmoment.com/invitation/abc\"", html);
        Assert.Contains("Confirmer ma présence", html);
        Assert.Contains("Dimanche 14 mars 2027 à 16h00", html);
        Assert.Contains("Mariage &lt;Awa &amp; Ibrahim&gt;", html);
        Assert.DoesNotContain("<script>", html);
    }
}
