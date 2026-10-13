using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    public enum EventStatus
    {
        Brouillon,
        Publie,
        Archive
    }
    [Table("events")]
    public class Event
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }


        // Relation avec Organizer
        [Required]
        [Column("organizer_id")]
        public Guid OrganizerId { get; set; }


        // Relation avec EventCategory
        [Required]
        [Column("category_id")]
        public Guid CategoryId { get; set; }


        // Nom de l'événement
        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;


        // URL unique
        [Required]
        [Column("slug")]
        public string Slug { get; set; } = string.Empty;


        // État de l'événement
        [Required]
        [Column("status")]
        public EventStatus Status { get; set; } = EventStatus.Brouillon;


        // Date de l'événement
        [Column("event_date")]
        public DateOnly? EventDate { get; set; }


        // Heure de début
        [Column("start_time")]
        public TimeOnly? StartTime { get; set; }


        // Image de couverture
        [Column("cover_image_url")]
        public string? CoverImageUrl { get; set; }


        // Personnalisation
        [Column("theme_color")]
        public string? ThemeColor { get; set; }


        [Column("theme_font")]
        public string? ThemeFont { get; set; }


        // Données personnalisées selon la catégorie
        [Required]
        [Column("custom_fields", TypeName = "jsonb")]
        public string CustomFields { get; set; } = "{}";


        // Date de publication
        [Column("published_at")]
        public DateTimeOffset? PublishedAt { get; set; }


        // Date de création
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }


        // Date de modification
        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; }


        // Navigation vers Organizer
        public Utilisateur Utilisateur { get; set; } = null!;


        // Navigation vers EventCategory
        public Event_categorie Category { get; set; } = null!;
    }

    
}
