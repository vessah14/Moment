using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace backend_EventMoment.Services.Email;

public interface IOrganizerEmailSender
{
    Task<bool> SendForOrganizerAsync(string toEmail, string subject, string htmlBody, string organizerEmail, string organizerName);
}

/// <summary>Envoie les e-mails via l'API transactionnelle Brevo.</summary>
public sealed class BrevoEmailSender : IEmailSender, IOrganizerEmailSender
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public BrevoEmailSender(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
    }

    public async Task<bool> SendAsync(string toEmail, string subject, string htmlBody)
        => await SendCoreAsync(toEmail, subject, htmlBody, null, null);

    public async Task<bool> SendForOrganizerAsync(string toEmail, string subject, string htmlBody, string organizerEmail, string organizerName)
        => await SendCoreAsync(toEmail, subject, htmlBody, organizerEmail, organizerName);

    private async Task<bool> SendCoreAsync(string toEmail, string subject, string htmlBody, string? organizerEmail, string? organizerName)
    {
        var apiKey = _config["Brevo:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("Brevo:ApiKey n'est pas configurée.");

        var configuredSenderEmail = _config["Brevo:SenderEmail"];
        var senderEmail = configuredSenderEmail;
        var platformName = _config["Brevo:SenderName"] ?? "TBF Moment";
        var senderName = !string.IsNullOrWhiteSpace(organizerEmail) && !string.IsNullOrWhiteSpace(organizerName)
            ? $"{organizerName} via {platformName}"
            : platformName;
        if (string.IsNullOrWhiteSpace(senderEmail))
            throw new InvalidOperationException("Brevo:SenderEmail doit contenir l'adresse Moment vérifiée dans Brevo.");

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
        request.Headers.TryAddWithoutValidation("api-key", apiKey);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        var payload = new Dictionary<string, object?>
        {
            ["sender"] = new
            {
                email = senderEmail,
                name = senderName
            },
            ["to"] = new[] { new { email = toEmail } },
            ["subject"] = subject,
            ["htmlContent"] = htmlBody
        };
        if (!string.IsNullOrWhiteSpace(organizerEmail))
            payload["replyTo"] = new { email = organizerEmail, name = organizerName };
        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            // Ne pas inclure les en-têtes de requête : ils contiennent la clé API.
            var detail = await response.Content.ReadAsStringAsync();
            var (code, message) = ParseBrevoError(detail);
            throw new BrevoApiException(
                $"Brevo a refusé l'envoi (HTTP {(int)response.StatusCode}) : {detail}",
                response.StatusCode,
                code,
                message);
        }

        return true;
    }

    // Réponse d'erreur Brevo : {"code":"unauthorized","message":"Key not found"}.
    private static (string? Code, string? Message) ParseBrevoError(string body)
    {
        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(body);
            var root = doc.RootElement;
            string? Read(string name) =>
                root.ValueKind == System.Text.Json.JsonValueKind.Object
                && root.TryGetProperty(name, out var v)
                && v.ValueKind == System.Text.Json.JsonValueKind.String
                    ? v.GetString()
                    : null;
            return (Read("code"), Read("message"));
        }
        catch (System.Text.Json.JsonException)
        {
            return (null, null);
        }
    }
}

/// <summary>Refus de l'API Brevo, avec le code et le message renvoyés par Brevo.</summary>
public sealed class BrevoApiException : HttpRequestException
{
    public string? BrevoCode { get; }
    public string? BrevoMessage { get; }

    public BrevoApiException(string message, System.Net.HttpStatusCode statusCode, string? brevoCode, string? brevoMessage)
        : base(message, null, statusCode)
    {
        BrevoCode = brevoCode;
        BrevoMessage = brevoMessage;
    }
}
