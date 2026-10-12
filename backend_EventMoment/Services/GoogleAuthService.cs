using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Services
{
    // Connexion Google par jeton d'accès. Le bouton officiel de Google affiche le nom et
    // l'adresse du compte du navigateur (« Continuer en tant que … ») : le site utilise donc
    // son propre bouton, qui ouvre la fenêtre OAuth de Google et reçoit un jeton d'accès.
    // Ce jeton n'est pas un JWT signé comme l'ID token : on le fait vérifier par Google.
    //  1) tokeninfo : jeton valide ET émis pour NOTRE ID client (aud). Sans ce contrôle, un
    //     jeton Google valide obtenu par une autre application pourrait être rejoué ici pour
    //     se connecter au compte de son propriétaire.
    //  2) userinfo : nom affiché (facultatif).
    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;

        public GoogleAuthService(IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _config = config;
            _httpClient = httpClientFactory.CreateClient();
        }

        public async Task<(string Subject, string Email, bool EmailVerified, string? Name)> ValidateAccessTokenAsync(string accessToken)
        {
            var clientId = _config["Authentication:Google:ClientId"];
            if (string.IsNullOrWhiteSpace(clientId))
                throw new InvalidOperationException("La connexion Google n'est pas configurée sur ce serveur.");

            TokenInfo? info;
            try
            {
                var response = await _httpClient.GetAsync(
                    "https://oauth2.googleapis.com/tokeninfo?access_token=" + Uri.EscapeDataString(accessToken));
                if (!response.IsSuccessStatusCode)
                    throw new InvalidOperationException("Jeton Google invalide.");
                info = await response.Content.ReadFromJsonAsync<TokenInfo>();
            }
            catch (Exception ex) when (ex is not InvalidOperationException)
            {
                throw new InvalidOperationException("Jeton Google invalide.");
            }

            if (info == null
                || !string.Equals(info.Aud, clientId, StringComparison.Ordinal)
                || string.IsNullOrWhiteSpace(info.Sub)
                || string.IsNullOrWhiteSpace(info.Email))
                throw new InvalidOperationException("Jeton Google invalide.");

            string? name = null;
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, "https://openidconnect.googleapis.com/v1/userinfo");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                using var response = await _httpClient.SendAsync(request);
                if (response.IsSuccessStatusCode)
                    name = (await response.Content.ReadFromJsonAsync<UserInfo>())?.Name;
            }
            catch
            {
                // Le nom ne sert qu'à pré-remplir un nouveau compte : l'adresse suffit.
            }

            return (info.Sub, info.Email, string.Equals(info.EmailVerified, "true", StringComparison.OrdinalIgnoreCase), name);
        }

        private class TokenInfo
        {
            [JsonPropertyName("aud")]
            public string? Aud { get; set; }

            [JsonPropertyName("sub")]
            public string? Sub { get; set; }

            [JsonPropertyName("email")]
            public string? Email { get; set; }

            // Google renvoie "true"/"false" sous forme de texte.
            [JsonPropertyName("email_verified")]
            public string? EmailVerified { get; set; }
        }

        private class UserInfo
        {
            [JsonPropertyName("name")]
            public string? Name { get; set; }
        }
    }
}
