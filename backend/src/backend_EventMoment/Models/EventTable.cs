using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    [Table("event_tables")]
    public class EventTable
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
        [Column("capacity")]
        public short Capacity { get; set; } = 8;

        [Required]
        [Column("position")]
        public short Position { get; set; }

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        public Event Event { get; set; } = null!;
    }
}
