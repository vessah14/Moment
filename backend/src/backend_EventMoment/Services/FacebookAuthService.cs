using System.Net.Http.Json;
using System.Text.Json.Serialization;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Services
{
    // Connexion Facebook : le jeton reçu du SDK Facebook côté frontend est un jeton d'accès
    // (pas un JWT auto-vérifiable comme Google/Apple), donc sa vérification passe par deux
    // appels à l'API Graph de Facebook :
    //  1) debug_token, avec le jeton d'APPLICATION (app_id|app_secret), pour confirmer que
    //     le jeton est valide ET qu'il a bien été émis pour NOTRE application — sans ce
    //     contrôle, un jeton Facebook valide mais émis pour une autre appli pourrait être
    //     rejoué ici pour usurper un compte.
    //  2) /me, avec le jeton utilisateur, pour récupérer id/nom/email.
    public class FacebookAuthService : IFacebookAuthService
    {
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;

        public FacebookAuthService(IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _config = config;
            _httpClient = httpClientFactory.CreateClient();
        }

        public async Task<(string Subject, string? Email, string? Name)> ValidateAccessTokenAsync(string accessToken)
        {
            var appId = _config["Authentication:Facebook:AppId"];
            var appSecret = _config["Authentication:Facebook:AppSecret"];
            if (string.IsNullOrWhiteSpace(appId) || string.IsNullOrWhiteSpace(appSecret))
                throw new InvalidOperationException("La connexion Facebook n'est pas configurée sur ce serveur.");

            DebugTokenResponse? debug;
            try
            {
                var debugUrl = "https://graph.facebook.com/debug_token"
                    + $"?input_token={Uri.EscapeDataString(accessToken)}"
                    + $"&access_token={Uri.EscapeDataString(appId)}|{Uri.EscapeDataString(appSecret)}";
                debug = await _httpClient.GetFromJsonAsync<DebugTokenResponse>(debugUrl);
            }
            catch
            {
                throw new InvalidOperationException("Jeton Facebook invalide.");
            }

            if (debug?.Data == null || !debug.Data.IsValid || !string.Equals(debug.Data.AppId, appId, StringComparison.Ordinal))
                throw new InvalidOperationException("Jeton Facebook invalide.");

            ProfileResponse? profile;
            try
            {
                var profileUrl = "https://graph.facebook.com/me"
                    + $"?fields=id,name,email&access_token={Uri.EscapeDataString(accessToken)}";
                profile = await _httpClient.GetFromJsonAsync<ProfileResponse>(profileUrl);
            }
            catch
            {
                throw new InvalidOperationException("Impossible de récupérer le profil Facebook.");
            }

            if (profile == null || string.IsNullOrWhiteSpace(profile.Id))
                throw new InvalidOperationException("Jeton Facebook invalide.");

            return (profile.Id, profile.Email, profile.Name);
        }

        public async Task<string> ExchangeCodeAsync(string code)
        {
            var appId = _config["Authentication:Facebook:AppId"];
            var appSecret = _config["Authentication:Facebook:AppSecret"];
            if (string.IsNullOrWhiteSpace(appId) || string.IsNullOrWhiteSpace(appSecret))
                throw new InvalidOperationException("La connexion Facebook n'est pas configurée sur ce serveur.");

            // Adresse de retour fixée par le serveur (et non fournie par le navigateur) : elle
            // doit être identique à celle de la demande et déclarée dans l'application Facebook.
            var redirectUri = $"{(_config["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/')}/auth/facebook/callback";
            TokenResponse? token;
            try
            {
                var url = "https://graph.facebook.com/v23.0/oauth/access_token"
                    + $"?client_id={Uri.EscapeDataString(appId)}"
                    + $"&redirect_uri={Uri.EscapeDataString(redirectUri)}"
                    + $"&client_secret={Uri.EscapeDataString(appSecret)}"
                    + $"&code={Uri.EscapeDataString(code)}";
                using var response = await _httpClient.GetAsync(url);
                token = response.IsSuccessStatusCode ? await response.Content.ReadFromJsonAsync<TokenResponse>() : null;
            }
            catch
            {
                token = null;
            }

            if (string.IsNullOrWhiteSpace(token?.AccessToken))
                throw new InvalidOperationException("Code Facebook invalide ou expiré. Recommencez la connexion.");
            return token.AccessToken;
        }

        private class TokenResponse
        {
            [JsonPropertyName("access_token")]
            public string? AccessToken { get; set; }
        }

        private class DebugTokenResponse
        {
            [JsonPropertyName("data")]
            public DebugTokenData? Data { get; set; }
        }

        private class DebugTokenData
        {
            [JsonPropertyName("app_id")]
            public string? AppId { get; set; }

            [JsonPropertyName("is_valid")]
            public bool IsValid { get; set; }
        }

        private class ProfileResponse
        {
            [JsonPropertyName("id")]
            public string Id { get; set; } = string.Empty;

            [JsonPropertyName("name")]
            public string? Name { get; set; }

            [JsonPropertyName("email")]
            public string? Email { get; set; }
        }
    }
}
