using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class CreateGiftItemDto
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Range(0, int.MaxValue)]
        public int PriceCents { get; set; }

        public string? ImageUrl { get; set; }
    }

    public class ReserveGiftDto
    {
        [Required, MaxLength(150)]
        public string ReservedByName { get; set; } = string.Empty;

        [EmailAddress]
        public string? ReservedByEmail { get; set; }
    }

    public class GiftItemDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PriceCents { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsReserved { get; set; }
        public string? ReservedByName { get; set; }
    }

    public class PublicEventDto
    {
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? ThemeColor { get; set; }
        public string? CoverImageUrl { get; set; }
        public DateOnly? EventDate { get; set; }
        public TimeOnly? StartTime { get; set; }
        public string? Tagline { get; set; }
        public string? Description { get; set; }
        // Nom du modèle de site choisi dans l'assistant (Éclat, Signal...) : pilote les
        // couleurs et la typographie du mini-site public.
        public string? Template { get; set; }
        public string? ThemeFont { get; set; }
        public string? LocationLabel { get; set; }
        public string? LocationAddress { get; set; }
        // Option « Visible sur Google » de l'assistant (CustomFields.options.searchable) :
        // sans elle, le site public demande aux moteurs de ne pas l'indexer.
        public bool Searchable { get; set; }
    }
}
