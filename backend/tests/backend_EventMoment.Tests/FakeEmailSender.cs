using backend_EventMoment.Services.Email;

namespace backend_EventMoment.Tests;

public class FakeEmailSender : IEmailSender
{
    public List<(string To, string Subject, string Body)> Sent { get; } = new();

    public Task<bool> SendAsync(string toEmail, string subject, string htmlBody)
    {
        Sent.Add((toEmail, subject, htmlBody));
        return Task.FromResult(true);
    }
}
