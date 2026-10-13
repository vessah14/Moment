using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos.Event
{
    public class CreateEventLocationDto
    {
        [Required]
        public string Label { get; set; } = string.Empty;

        public string? Address { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        public string? GooglePlaceId { get; set; }

        public short Position { get; set; } = 0;
    }
}