using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    [Table("sponsors")]
    public class Sponsor
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
        [Column("tier")]
        public string Tier { get; set; } = "Standard";

        [Column("logo_url")]
        public string? LogoUrl { get; set; }

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        public Event Event { get; set; } = null!;
    }
}
