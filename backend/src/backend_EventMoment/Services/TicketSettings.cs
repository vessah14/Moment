using System.Text.Json;

namespace backend_EventMoment.Services
{
    // Billet choisi par l'organisateur dans le Builder, rangé dans events.custom_fields :
    //   {"ticket": {"style": "fairepart", "note": "Tenue blanche exigée"}}
    // Seuls les 10 modèles connus sont acceptés ; sinon le site prend le modèle conseillé.
    public static class TicketSettings
    {
        public static readonly HashSet<string> Styles = new(StringComparer.Ordinal)
        {
            "classique", "or", "minimal", "fairepart", "pagne", "concert", "stade", "badge", "polaroid", "sobre",
        };

        public static (string? Style, string? Note) Read(string? customFields)
        {
            try
            {
                using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(customFields) ? "{}" : customFields);
                if (doc.RootElement.ValueKind != JsonValueKind.Object
                    || !doc.RootElement.TryGetProperty("ticket", out var t) || t.ValueKind != JsonValueKind.Object)
                    return (null, null);
                string? Str(string name) =>
                    t.TryGetProperty(name, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null;
                var style = Str("style");
                var note = Str("note")?.Trim();
                return (style != null && Styles.Contains(style) ? style : null,
                    string.IsNullOrEmpty(note) ? null : note.Length > 40 ? note[..40] : note);
            }
            catch (JsonException)
            {
                return (null, null);
            }
        }
    }
}
