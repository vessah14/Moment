namespace backend_EventMoment.Services.Email;

public static class AdminNotificationRecipients
{
    public static IReadOnlyList<string> Get(IConfiguration? configuration)
    {
        var recipients = new List<string>();
        var primaryEmail = configuration?["Notifications:AdminEmail"] ?? configuration?["Brevo:SenderEmail"];
        AddIfValid(recipients, primaryEmail);

        if (configuration != null)
        {
            foreach (var setting in configuration.GetSection("Notifications:AdditionalAdminEmails").GetChildren())
                AddIfValid(recipients, setting.Value);
        }

        return recipients;
    }

    private static void AddIfValid(List<string> recipients, string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return;

        var normalizedEmail = email.Trim();
        if (!recipients.Contains(normalizedEmail, StringComparer.OrdinalIgnoreCase))
            recipients.Add(normalizedEmail);
    }
}
