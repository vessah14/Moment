using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    [Table("gift_items")]
    public class GiftItem
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

        [Column("description")]
        public string? Description { get; set; }

        [Required]
        [Column("price_cents")]
        public int PriceCents { get; set; }

        [Column("image_url")]
        public string? ImageUrl { get; set; }

        [Required]
        [Column("is_reserved")]
        public bool IsReserved { get; set; }

        [Column("reserved_by_name")]
        public string? ReservedByName { get; set; }

        [Column("reserved_by_email")]
        public string? ReservedByEmail { get; set; }

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        public Event Event { get; set; } = null!;
    }
}
