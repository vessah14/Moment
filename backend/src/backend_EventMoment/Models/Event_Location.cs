using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend_EventMoment.Models;

namespace backend_EventMoment
{
    [Table("event_locations")]
    public class Event_Location
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [Column("label")]
        public string Label { get; set; } = string.Empty; //ex: 'ceremonie','Reception'

        [Column("address")]
        public string? Address { get; set; }

        [Column("latitude", TypeName = "numeric(9,6)")]
        public decimal? Lattitude { get; set; }

        [Column("longitude", TypeName = "numeric(9,6)")]
        public decimal? Longitude { get; set; }

        [Column("google_place_id")]
        public string? GooglePlaceId { get; set; }

        [Required]
        [Column("position")]
        public short Position { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        //Navigation vers Event
        public Event Event { get; set; } = null!;
    }
}