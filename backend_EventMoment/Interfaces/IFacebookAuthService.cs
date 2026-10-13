namespace backend_EventMoment.Interfaces
{
    public interface IFacebookAuthService
    {
        // Vérifie un jeton d'accès Facebook auprès de l'API Graph (endpoint debug_token,
        // avec le jeton d'application) puis récupère le profil (id, nom, email). Lève
        // InvalidOperationException si invalide ou si la connexion Facebook n'est pas
        // configurée sur ce serveur.
        Task<(string Subject, string? Email, string? Name)> ValidateAccessTokenAsync(string accessToken);

        // Échange le code à usage unique renvoyé par Facebook (redirection vers
        // {Frontend:BaseUrl}/auth/facebook/callback) contre un jeton d'accès.
        Task<string> ExchangeCodeAsync(string code);
    }
}
