using System.Globalization;
using System.Text.Json;
using backend_EventMoment.Models;

namespace backend_EventMoment.Services
{
    // Règles du formulaire de réponse, réglées dans le contenu du bloc RSVP :
    //   {"deadline": "2027-03-01", "maxCompanions": 2, "allowMaybe": true}
    // Date limite (incluse), nombre d'accompagnants par invitation et réponse « Peut-être ».
    // Sans réglage : réponses jusqu'au jour de l'événement, 20 accompagnants au plus.
    public sealed record RsvpRules(DateOnly? Deadline, int MaxCompanions, bool AllowMaybe)
    {
        public const int Limit = 20;

        public static readonly RsvpRules Default = new(null, Limit, false);

        public static RsvpRules Read(string? blockContent)
        {
            try
            {
                using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(blockContent) ? "{}" : blockContent);
                var root = doc.RootElement;
                if (root.ValueKind != JsonValueKind.Object) return Default;

                DateOnly? deadline = root.TryGetProperty("deadline", out var d) && d.ValueKind == JsonValueKind.String
                    && DateOnly.TryParseExact(d.GetString(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed)
                    ? parsed
                    : null;
                var max = root.TryGetProperty("maxCompanions", out var m) && m.ValueKind == JsonValueKind.Number && m.TryGetInt32(out var n)
                    ? Math.Clamp(n, 0, Limit)
                    : Limit;
                var maybe = root.TryGetProperty("allowMaybe", out var a) && a.ValueKind == JsonValueKind.True;
                return new RsvpRules(deadline, max, maybe);
            }
            catch (JsonException)
            {
                return Default;
            }
        }

        // Places fixées pour un invité (lui compris) : remplacent le maximum de l'événement.
        public RsvpRules ForSeats(short? seats) =>
            seats is > 0 ? this with { MaxCompanions = Math.Min(seats.Value - 1, Limit) } : this;

        // On peut répondre jusqu'au jour de l'événement inclus, et jusqu'à la date limite incluse.
        public bool IsClosed(Event eventEntity, DateOnly today) =>
            (eventEntity.EventDate.HasValue && eventEntity.EventDate.Value < today)
            || (Deadline.HasValue && Deadline.Value < today);

        public void Validate(bool confirmed, bool maybe, short accompanyingCount)
        {
            if (maybe && !AllowMaybe)
                throw new InvalidOperationException("La réponse « Peut-être » n'est pas proposée pour cet événement.");
            if (confirmed && accompanyingCount > MaxCompanions)
                throw new InvalidOperationException(MaxCompanions == 0
                    ? "Cette invitation est personnelle : aucun accompagnant n'est prévu."
                    : $"Cette invitation est valable pour {MaxCompanions} accompagnant(s) au plus.");
        }
    }
}
