using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    [Table("event_blocks")]
    public class EventBlock
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        // Type libre (pas un enum) : la colonne est du TEXT en base sans contrainte
        // CHECK, et l'Event Builder définit ses propres noms de blocs (Rebours,
        // Histoire, Intervenants, "Livre d'or", ...) qui ne correspondent à aucun
        // identifiant C# propre — un enum figé aurait forcé une table de
        // correspondance artificielle des deux côtés pour rien.
        [Required]
        [Column("block_type")]
        public string BlockType { get; set; } = string.Empty;

        [Required]
        [Column("position")]
        public short Position { get; set; }

        [Required]
        [Column("is_visible")]
        public bool IsVisible { get; set; } = true;

        [Required]
        [Column("content", TypeName = "jsonb")]
        public string Content { get; set; } = "{}";

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Required]
        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; }

        public Event Event { get; set; } = null!;
    }
}