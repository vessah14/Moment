using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class CreateEventDto
    {
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public Guid CategoryId { get; set; }

        public DateOnly? EventDate { get; set; }

        public TimeOnly? StartTime { get; set; }

        // Doit pointer vers une couverture téléversée sur la plateforme (contrôlé dans
        // EventService) : la valeur est injectée dans le CSS du site public.
        [MaxLength(300)]
        public string? CoverImageUrl { get; set; }

        // Couleur hexadécimale stricte : elle est injectée dans le CSS du site public,
        // une valeur libre ("red), url(https://…") permettrait de pister les visiteurs.
        [RegularExpression("^#[0-9a-fA-F]{6}$", ErrorMessage = "La couleur doit être au format #RRGGBB.")]
        public string? ThemeColor { get; set; }

        [MaxLength(100)]
        public string? ThemeFont { get; set; }

        [JsonDocument, MaxLength(20000)]
        public string CustomFields { get; set; } = "{}";
    }
}