using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    [Table("event_stats_daily")]
    public class EventStatsDaily
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [Column("stat_date")]
        public DateOnly StatDate { get; set; }

        [Required]
        [Column("visits_count")]
        public int VisitsCount { get; set; } = 0;

        [Required]
        [Column("shares_count")]
        public int SharesCount { get; set; } = 0;

        // Navigation vers Event
        public Event Event { get; set; } = null!;
    }
}