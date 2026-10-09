using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    [Table("guest_groups")]
    public class Guest_group
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [Column("label")]
        public string Label { get; set; } = string.Empty;

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }
    }
}
