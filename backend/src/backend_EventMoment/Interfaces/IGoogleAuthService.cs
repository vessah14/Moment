namespace backend_EventMoment.Interfaces
{
    public interface IGoogleAuthService
    {
        // Vérifie un jeton d'accès Google (fenêtre OAuth ouverte par notre propre bouton)
        // auprès de Google : émis pour NOTRE ID client, non expiré, e-mail présent. Lève
        // InvalidOperationException sinon, ou si Google n'est pas configuré sur ce serveur.
        Task<(string Subject, string Email, bool EmailVerified, string? Name)> ValidateAccessTokenAsync(string accessToken);
    }
}
