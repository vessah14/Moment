using System.Text.Json;
using backend_EventMoment.Dtos;
using backend_EventMoment.Models;

namespace backend_EventMoment.Services
{
    internal static class PublicEventMapper
    {
        public static PublicEventDto Map(Event entity, Event_Location? location, string? heroContent)
        {
            string? tagline = null;
            string? description = null;
            string? template = null;
            var searchable = false;
            try
            {
                using var doc = JsonDocument.Parse(entity.CustomFields);
                if (doc.RootElement.TryGetProperty("tagline", out var taglineValue))
                    tagline = taglineValue.GetString();
                if (doc.RootElement.TryGetProperty("description", out var descriptionValue))
                    description = descriptionValue.GetString();
                if (doc.RootElement.TryGetProperty("template", out var templateValue)
                    && templateValue.ValueKind == JsonValueKind.String)
                    template = templateValue.GetString();
                searchable = EventSearchability.IsSearchable(doc.RootElement);
            }
            catch (Exception exception) when (exception is JsonException or InvalidOperationException)
            {
                // CustomFields mal formé ou vide : les champs personnalisés restent absents.
            }

            string? heroTitle = null;
            string? heroSubtitle = null;
            string? heroColor = null;
            string? heroKicker = null;
            if (!string.IsNullOrWhiteSpace(heroContent))
            {
                try
                {
                    using var doc = JsonDocument.Parse(heroContent);
                    if (doc.RootElement.ValueKind == JsonValueKind.Object)
                    {
                        string? Read(string name) =>
                            doc.RootElement.TryGetProperty(name, out var value)
                            && value.ValueKind == JsonValueKind.String
                                ? value.GetString()
                                : null;
                        heroTitle = Read("title");
                        heroSubtitle = Read("subtitle");
                        heroColor = Read("color");
                        heroKicker = Read("kicker");
                    }
                }
                catch (JsonException)
                {
                    // Un contenu Hero invalide ne doit pas rendre le site public indisponible.
                }
            }

            return new PublicEventDto
            {
                Name = entity.Name,
                Slug = entity.Slug,
                ThemeColor = entity.ThemeColor,
                CoverImageUrl = entity.CoverImageUrl,
                EventDate = entity.EventDate,
                StartTime = entity.StartTime,
                Tagline = tagline,
                Description = description,
                HeroTitle = heroTitle,
                HeroSubtitle = heroSubtitle,
                HeroColor = heroColor,
                HeroKicker = heroKicker,
                Template = template,
                ThemeFont = entity.ThemeFont,
                LocationLabel = location?.Label,
                LocationAddress = location?.Address,
                Searchable = searchable,
            };
        }
    }
}
