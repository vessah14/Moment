using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    [Table("ticket_types")]
    public class TicketType
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("price_cents")]
        public int PriceCents { get; set; }

        [Required]
        [Column("quota")]
        public int Quota { get; set; }

        [Required]
        [Column("sold_count")]
        public int SoldCount { get; set; }

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        public Event Event { get; set; } = null!;
    }
}
