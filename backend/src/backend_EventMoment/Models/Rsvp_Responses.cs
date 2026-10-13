using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    [Table("rsvp_responses")]
    public class RsvpResponse
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("guest_id")]
        public Guid GuestId { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Column("confirmed")]
        public bool? Confirmed { get; set; }

        [Required]
        [Column("accompanying_count")]
        public short AccompanyingCount { get; set; } = 0;

        [Column("message")]
        public string? Message { get; set; }

        [Column("responded_at")]
        public DateTimeOffset? RespondedAt { get; set; }

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        // Navigation
        public Guest Guest { get; set; } = null!;
        public Event Event { get; set; } = null!;
    }
}