using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace backend_EventMoment.Services
{
    // Alertes automatiques sur un message du livre d'or / mur des vœux, montrées à
    // l'organisateur avant validation : un vœu projeté dans la salle ne doit pas servir
    // de publicité (numéro, lien) ni porter d'insulte.
    public static class WishAlerts
    {
        public const string Phone = "Contient un numéro de téléphone";
        public const string Link = "Contient un lien";
        public const string Word = "Contient un mot signalé";

        // 8 chiffres ou plus, séparés ou non par des espaces, points ou tirets (« 677 12 34 56 »).
        private static readonly Regex PhonePattern = new(@"(\d[\s.\-]*){8,}", RegexOptions.Compiled);
        private static readonly Regex LinkPattern = new(
            @"https?://|www\.|\b[a-z0-9-]+\.(com|cm|net|org|fr|info|biz|me|ly|io|co|app|link)\b",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        // Mots signalés, sans accents ni majuscules (comparés mot à mot).
        private static readonly HashSet<string> FlaggedWords = new(StringComparer.Ordinal)
        {
            "con", "conne", "connard", "connasse", "salaud", "salope", "pute", "putain", "merde",
            "encule", "enculer", "batard", "abruti", "debile", "idiot", "imbecile",
            "escroc", "escrocs", "voleur", "voleurs", "arnaque", "arnaqueur", "fuck", "shit", "bitch",
        };

        private static readonly Regex Words = new(@"[a-z]+", RegexOptions.Compiled);

        // Première alerte trouvée, ou null si le message peut passer tel quel.
        public static string? Detect(string? text)
        {
            if (string.IsNullOrWhiteSpace(text)) return null;
            if (PhonePattern.IsMatch(text)) return Phone;
            if (LinkPattern.IsMatch(text)) return Link;
            var plain = RemoveAccents(text.ToLowerInvariant());
            return Words.Matches(plain).Any(m => FlaggedWords.Contains(m.Value)) ? Word : null;
        }

        // Validation automatique réglée dans le bloc « Livre d'or » : {"autoApprove": true}.
        // Désactivée par défaut ; seuls les messages sans alerte en profitent.
        public static bool AutoApprove(string? blockContent)
        {
            try
            {
                using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(blockContent) ? "{}" : blockContent);
                return doc.RootElement.ValueKind == JsonValueKind.Object
                    && doc.RootElement.TryGetProperty("autoApprove", out var value)
                    && value.ValueKind == JsonValueKind.True;
            }
            catch (JsonException)
            {
                return false;
            }
        }

        private static string RemoveAccents(string text)
        {
            var builder = new StringBuilder(text.Length);
            foreach (var c in text.Normalize(NormalizationForm.FormD))
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                    builder.Append(c);
            return builder.ToString();
        }
    }
}
