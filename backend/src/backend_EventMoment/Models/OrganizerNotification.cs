using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    [Table("organizer_notifications")]
    public class OrganizerNotification
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("organizer_id")]
        public Guid OrganizerId { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [MaxLength(40)]
        [Column("type")]
        public string Type { get; set; } = string.Empty;

        [Required]
        [MaxLength(160)]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        [Column("message")]
        public string Message { get; set; } = string.Empty;

        [Required]
        [MaxLength(250)]
        [Column("link")]
        public string Link { get; set; } = string.Empty;

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Column("read_at")]
        public DateTimeOffset? ReadAt { get; set; }

        public Event Event { get; set; } = null!;
    }
}
