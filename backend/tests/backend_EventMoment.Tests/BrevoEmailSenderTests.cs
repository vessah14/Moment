using System.Net;
using System.Text.Json;
using backend_EventMoment.Services.Email;
using Microsoft.Extensions.Configuration;

namespace backend_EventMoment.Tests;

public class BrevoEmailSenderTests
{
    [Fact]
    public async Task SendForOrganizerAsync_UsesPlatformSenderAndOrganizerReplyTo()
    {
        var handler = new RecordingHandler();
        using var client = new HttpClient(handler);
        var sender = new BrevoEmailSender(client, CreateConfig());

        await sender.SendForOrganizerAsync(
            "guest@example.com",
            "Invitation",
            "Bonjour",
            "organizer@example.com",
            "Awa Diop");

        using var payload = JsonDocument.Parse(handler.Body!);
        var root = payload.RootElement;
        Assert.Equal("notifications@moment.example", root.GetProperty("sender").GetProperty("email").GetString());
        Assert.Equal("Awa Diop via Moment", root.GetProperty("sender").GetProperty("name").GetString());
        Assert.Equal("organizer@example.com", root.GetProperty("replyTo").GetProperty("email").GetString());
        Assert.Equal("Awa Diop", root.GetProperty("replyTo").GetProperty("name").GetString());
        Assert.Equal("guest@example.com", root.GetProperty("to")[0].GetProperty("email").GetString());
    }

    [Fact]
    public async Task SendAsync_OmitsReplyToWhenNoOrganizerIsProvided()
    {
        var handler = new RecordingHandler();
        using var client = new HttpClient(handler);
        var sender = new BrevoEmailSender(client, CreateConfig());

        await sender.SendAsync("guest@example.com", "Notification", "Bonjour");

        using var payload = JsonDocument.Parse(handler.Body!);
        Assert.False(payload.RootElement.TryGetProperty("replyTo", out _));
        Assert.Equal("notifications@moment.example", payload.RootElement.GetProperty("sender").GetProperty("email").GetString());
    }

    private static IConfiguration CreateConfig() => new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Brevo:ApiKey"] = "unit-test-key",
            ["Brevo:SenderEmail"] = "notifications@moment.example",
            ["Brevo:SenderName"] = "Moment",
        })
        .Build();

    private sealed class RecordingHandler : HttpMessageHandler
    {
        public string? Body { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Body = await request.Content!.ReadAsStringAsync(cancellationToken);
            return new HttpResponseMessage(HttpStatusCode.Created);
        }
    }
}