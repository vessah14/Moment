using System.Text.Json;

namespace backend_EventMoment.Services
{
    // Choix « côté » du formulaire de réponse, réglé par modèle dans le contenu du bloc RSVP :
    //   {"sideLabel": "Vous êtes invité par", "sides": ["Famille de la mariée", "Famille du marié"]}
    // (famille, pronostic, département, branche…). Une réponse n'est acceptée que si son
    // choix fait partie de cette liste.
    public static class RsvpSides
    {
        public const int MaxSides = 8;
        public const int MaxLength = 80;

        public static IReadOnlyList<string> Read(string? blockContent)
        {
            try
            {
                using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(blockContent) ? "{}" : blockContent);
                if (doc.RootElement.ValueKind != JsonValueKind.Object
                    || !doc.RootElement.TryGetProperty("sides", out var sides) || sides.ValueKind != JsonValueKind.Array)
                    return Array.Empty<string>();
                return sides.EnumerateArray()
                    .Where(s => s.ValueKind == JsonValueKind.String)
                    .Select(s => s.GetString()!.Trim())
                    .Where(s => s.Length > 0)
                    .Select(s => s.Length > MaxLength ? s[..MaxLength] : s)
                    .Distinct(StringComparer.Ordinal)
                    .Take(MaxSides)
                    .ToList();
            }
            catch (JsonException)
            {
                return Array.Empty<string>();
            }
        }

        // Choix retenu pour une réponse : null si la question n'existe pas ou si l'invité
        // n'a rien choisi ; erreur si le choix n'est pas dans la liste.
        public static string? Validate(string? blockContent, string? side)
        {
            var value = side?.Trim();
            if (string.IsNullOrEmpty(value)) return null;
            var allowed = Read(blockContent);
            if (!allowed.Contains(value, StringComparer.Ordinal))
                throw new InvalidOperationException("Ce choix n'est pas proposé pour cet événement.");
            return value;
        }
    }
}
