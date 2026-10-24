using System.Text.Json;

namespace backend_EventMoment.Services
{
    // Organisateur saisi dans l'assistant de création, rangé dans events.custom_fields :
    //   {"organizer": {"name": "IUGET de Bonabéri", "logoUrl": "/uploads/blocks/…/logo.png"}}
    // Le logo doit être une image envoyée sur nos serveurs (chemin relatif) ou sur https.
    public static class OrganizerSettings
    {
        public const int MaxNameLength = 80;

        public static (string? Name, string? LogoUrl) Read(string? customFields)
        {
            try
            {
                using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(customFields) ? "{}" : customFields);
                if (doc.RootElement.ValueKind != JsonValueKind.Object
                    || !doc.RootElement.TryGetProperty("organizer", out var o) || o.ValueKind != JsonValueKind.Object)
                    return (null, null);
                string? Str(string name) =>
                    o.TryGetProperty(name, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString()?.Trim() : null;
                var name = Str("name");
                var logo = Str("logoUrl");
                return (string.IsNullOrEmpty(name) ? null : name.Length > MaxNameLength ? name[..MaxNameLength] : name,
                    IsSafeImageUrl(logo) ? logo : null);
            }
            catch (JsonException)
            {
                return (null, null);
            }
        }

        private static bool IsSafeImageUrl(string? url) =>
            !string.IsNullOrEmpty(url) && url.Length <= 500
            && ((url.StartsWith('/') && !url.StartsWith("//") && !url.Contains('\\'))
                || (Uri.TryCreate(url, UriKind.Absolute, out var u) && u.Scheme == Uri.UriSchemeHttps));
    }
}
