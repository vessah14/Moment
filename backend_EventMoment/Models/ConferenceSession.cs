using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    [Table("conference_sessions")]
    public class ConferenceSession
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Column("speaker_id")]
        public Guid? SpeakerId { get; set; }

        [Required]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("room")]
        public string? Room { get; set; }

        [Column("start_time")]
        public DateTimeOffset? StartTime { get; set; }

        [Column("end_time")]
        public DateTimeOffset? EndTime { get; set; }

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        public Event Event { get; set; } = null!;
        public Speaker? Speaker { get; set; }
    }
}
