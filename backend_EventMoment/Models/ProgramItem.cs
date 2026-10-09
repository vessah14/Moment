using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    [Table("program_items")]
    public class ProgramItem
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("speaker")]
        public string? Speaker { get; set; }

        [Column("location")]
        public string? Location { get; set; }

        [Column("start_time")]
        public DateTimeOffset? StartTime { get; set; }

        [Required]
        [Column("duration_minutes")]
        public int DurationMinutes { get; set; } = 30;

        [Required]
        [Column("capacity")]
        public int Capacity { get; set; } = 50;

        [Required]
        [Column("notify")]
        public bool Notify { get; set; }

        [Required]
        [Column("position")]
        public short Position { get; set; }

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        public Event Event { get; set; } = null!;
    }
}
