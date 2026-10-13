namespace backend_EventMoment.Services.Email
{
    public interface IEmailSender
    {
        // Renvoie true si le message a réellement été remis à un serveur SMTP,
        // false s'il n'a été que journalisé faute de configuration (Smtp:Host absent).
        // Les appelants qui comptent des envois réussis (campagnes) doivent se fier
        // à cette valeur plutôt que de supposer un succès dès l'absence d'exception.
        Task<bool> SendAsync(string toEmail, string subject, string htmlBody);
    }
}
