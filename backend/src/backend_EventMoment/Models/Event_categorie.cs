using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment
{
    [Table("event_categories")]
    public class Event_categorie
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Le code is required")]
        [MaxLength(200, ErrorMessage = "code cannot passed 200 characters")]
        [Column("code")]
        public string Code { get; set; } = string.Empty; //ex:mariage,anniversaire

        [Column("description")]
        public string? Description { get; set; }

        [Required]
        [Column("label")]
        public string Label { get; set; } = string.Empty;

        [Required]
        [Column("is_active")]
        public bool Is_active { get; set; }

        [Required]
        [Column("field_schema", TypeName = "jsonb")]
        public string FieldSchema { get; set; } = "[]";

        [Required]
        [Column("block_schema", TypeName = "jsonb")]
        public string BlockSchema { get; set; } = "[]";

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Required]
        [Column("updated_at")]
        public DateTimeOffset UpdateAt { get; set; }
    }
}