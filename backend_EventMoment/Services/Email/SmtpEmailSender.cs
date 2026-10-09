using System.Net;
using System.Net.Mail;

namespace backend_EventMoment.Services.Email
{
    // Envoie un e-mail via SMTP si "Smtp:Host" est configuré (appsettings, User Secrets
    // ou variable d'environnement). Sans configuration, le message est simplement journalisé
    // — utile en développement tant qu'aucun fournisseur SMTP n'est branché.
    public class SmtpEmailSender : IEmailSender
    {
        private readonly IConfiguration _config;
        private readonly IHostEnvironment _environment;
        private readonly ILogger<SmtpEmailSender> _logger;

        public SmtpEmailSender(IConfiguration config, IHostEnvironment environment, ILogger<SmtpEmailSender> logger)
        {
            _config = config;
            _environment = environment;
            _logger = logger;
        }

        public async Task<bool> SendAsync(string toEmail, string subject, string htmlBody)
        {
            var host = _config["Smtp:Host"];
            if (string.IsNullOrWhiteSpace(host))
            {
                // Hors développement, ne jamais journaliser le corps du message : il peut
                // contenir un secret (ex. lien de réinitialisation de mot de passe).
                if (_environment.IsDevelopment())
                {
                    _logger.LogWarning(
                        "Smtp:Host non configuré — e-mail non envoyé (environnement de développement, contenu journalisé). À: {ToEmail} | Sujet: {Subject}\n{Body}",
                        toEmail, subject, htmlBody);
                }
                else
                {
                    _logger.LogWarning(
                        "Smtp:Host non configuré — e-mail non envoyé. À: {ToEmail} | Sujet: {Subject}",
                        toEmail, subject);
                }
                return false;
            }

            var port = int.TryParse(_config["Smtp:Port"], out var p) ? p : 587;
            var user = _config["Smtp:User"];
            var password = _config["Smtp:Password"];
            var from = _config["Smtp:From"];
            if (string.IsNullOrWhiteSpace(from))
                throw new InvalidOperationException("Smtp:From doit être configuré lorsque Smtp:Host est défini.");
            var fromName = _config["Smtp:FromName"] ?? "TBF Moment";

            using var client = new SmtpClient(host, port)
            {
                EnableSsl = true,
                Credentials = string.IsNullOrWhiteSpace(user) ? null : new NetworkCredential(user, password),
            };

            using var message = new MailMessage
            {
                From = new MailAddress(from, fromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true,
            };
            message.To.Add(toEmail);

            await client.SendMailAsync(message);
            return true;
        }
    }
}
