using backend_EventMoment.Models;
using backend_EventMoment.Services;
using Microsoft.Extensions.Configuration;

namespace backend_EventMoment.Tests;

public class PageReportTests
{
    private static (PageReportService Service, FakeEmailSender Email, string Slug) Setup(EventStatus status = EventStatus.Publie)
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var evt = new Event
        {
            Id = Guid.NewGuid(), OrganizerId = Guid.NewGuid(), CategoryId = Guid.NewGuid(), Name = "Obsèques de Papa",
            Slug = $"evt-{Guid.NewGuid():N}", Status = status, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Events.Add(evt);
        context.SaveChanges();
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Notifications:AdminEmail"] = "admin@example.com",
            ["Frontend:BaseUrl"] = "https://tbfmoment.example",
        }).Build();
        var email = new FakeEmailSender();
        return (new PageReportService(context, email, config), email, evt.Slug);
    }

    [Fact]
    public async Task SendsTheReportToTheTeam_WithTheVisitorTextEncoded()
    {
        var (service, email, slug) = Setup();

        Assert.True(await service.ReportAsync(slug, "deces", "<script>alert(1)</script> Il est vivant", "  +237 6 99\r\nBcc: x@y.z "));

        var sent = Assert.Single(email.Sent);
        Assert.Equal("admin@example.com", sent.To);
        Assert.DoesNotContain("\n", sent.Subject);
        Assert.Contains("Faux avis de décès", sent.Subject);
        Assert.Contains($"https://tbfmoment.example/e/{slug}", sent.Body);
        Assert.Contains("&lt;script&gt;", sent.Body);
        Assert.DoesNotContain("<script>", sent.Body);
        Assert.Contains("+237 6 99 Bcc: x@y.z", sent.Body);
    }

    [Fact]
    public async Task RejectsAnUnknownReason_AndIgnoresUnpublishedPages()
    {
        var (service, email, slug) = Setup();
        await Assert.ThrowsAsync<ArgumentException>(() => service.ReportAsync(slug, "spam-libre", null, null));

        var (draft, draftEmail, draftSlug) = Setup(EventStatus.Brouillon);
        Assert.False(await draft.ReportAsync(draftSlug, "arnaque", null, null));
        Assert.False(await service.ReportAsync("inconnue", "arnaque", null, null));
        Assert.Empty(email.Sent);
        Assert.Empty(draftEmail.Sent);
    }

    [Fact]
    public async Task CapsTheMessageLength()
    {
        var (service, email, slug) = Setup();
        await service.ReportAsync(slug, "autre", new string('a', 5000), null);
        Assert.DoesNotContain(new string('a', PageReportService.MaxMessage + 1), Assert.Single(email.Sent).Body);
    }
}
