using System.Text.Json;

namespace backend_EventMoment.Services
{
    // Modèles premium (ceux qui ont un thème animé, frontend/src/data/templates.js). Le modèle
    // choisi est rangé par son nom dans events.custom_fields ({"template": "Toghu Royal"}).
    // Liste tenue à jour avec le site : un test du frontend vérifie qu'elle correspond.
    public static class PremiumTemplates
    {
        public static readonly HashSet<string> Names = new(StringComparer.Ordinal)
        {
            "Noor", "Bloom", "Toghu Royal", "Ndop", "Fiesta", "Prestige", "Arena", "Live", "Summit",
            "Horizon", "Nuage", "Grâce", "Campus", "Toge", "Mémoire", "Racines", "Velvet", "Atelier",
            "Libre", "Douceur", "Souvenir", "Étoile", "Cœur", "Hilal", "Aurore", "Unité", "Maman", "Minuit", "Envol",
        };

        // Nom du modèle premium rangé dans custom_fields, ou null (modèle gratuit, aucun, JSON invalide).
        public static string? FromCustomFields(string? customFields)
        {
            try
            {
                using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(customFields) ? "{}" : customFields);
                return doc.RootElement.ValueKind == JsonValueKind.Object
                    && doc.RootElement.TryGetProperty("template", out var t)
                    && t.ValueKind == JsonValueKind.String
                    && Names.Contains(t.GetString()!)
                        ? t.GetString()
                        : null;
            }
            catch (JsonException)
            {
                return null;
            }
        }
    }
}
