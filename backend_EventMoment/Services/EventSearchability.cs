using System.Text.Json;

namespace backend_EventMoment.Services
{
    // Option « Visible sur Google » choisie dans l'assistant de création, rangée dans
    // CustomFields : { "options": { "searchable": true } }. Absente ou mal formée =>
    // non indexable : un site d'événement reste privé tant que l'organisateur ne l'a
    // pas explicitement ouvert aux moteurs de recherche.
    public static class EventSearchability
    {
        public static bool IsSearchable(JsonElement customFields) =>
            customFields.ValueKind == JsonValueKind.Object
            && customFields.TryGetProperty("options", out var options)
            && options.ValueKind == JsonValueKind.Object
            && options.TryGetProperty("searchable", out var searchable)
            && searchable.ValueKind == JsonValueKind.True;

        public static bool IsSearchable(string? customFields)
        {
            if (string.IsNullOrWhiteSpace(customFields)) return false;
            try
            {
                using var doc = JsonDocument.Parse(customFields);
                return IsSearchable(doc.RootElement);
            }
            catch (JsonException)
            {
                return false;
            }
        }
    }
}
