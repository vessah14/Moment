using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    [Table("seating_assignments")]
    public class SeatingAssignment
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [Column("guest_id")]
        public Guid GuestId { get; set; }

        [Required]
        [Column("table_id")]
        public Guid TableId { get; set; }

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        public Event Event { get; set; } = null!;
        public Guest Guest { get; set; } = null!;
        public EventTable Table { get; set; } = null!;
    }
}
