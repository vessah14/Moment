using System.Globalization;
using System.Text;

namespace backend_EventMoment.Services
{
    // Adresse publique d'un événement (/e/{slug}). Doit être sûre dans une URL (lettres,
    // chiffres, tirets) et unique sur toute la plateforme — deux organisateurs peuvent
    // tout à fait appeler leur événement "Mariage".
    public static class SlugGenerator
    {
        private const int MaxLength = 60;

        public static string Slugify(string? text)
        {
            var decomposed = (text ?? string.Empty).Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder(decomposed.Length);
            var lastWasDash = true; // évite un tiret en tête

            foreach (var c in decomposed)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark)
                    continue; // accents : "é" → "e"

                var lower = char.ToLowerInvariant(c);
                if (lower is >= 'a' and <= 'z' or >= '0' and <= '9')
                {
                    sb.Append(lower);
                    lastWasDash = false;
                }
                else if (!lastWasDash)
                {
                    sb.Append('-');
                    lastWasDash = true;
                }

                if (sb.Length >= MaxLength)
                    break;
            }

            var slug = sb.ToString().Trim('-');
            return slug.Length == 0 ? "evenement" : slug;
        }

        public static async Task<string> GenerateUniqueAsync(string? name, Func<string, Task<bool>> isTaken)
        {
            var baseSlug = Slugify(name);
            if (!await isTaken(baseSlug))
                return baseSlug;

            for (var i = 2; i <= 20; i++)
            {
                var candidate = $"{baseSlug}-{i}";
                if (!await isTaken(candidate))
                    return candidate;
            }

            // Nom très courant : suffixe aléatoire plutôt que de tester indéfiniment.
            return $"{baseSlug}-{Guid.NewGuid().ToString("N")[..6]}";
        }
    }
}
