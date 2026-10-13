using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class CreateRsvpResponseDto
    {
        [Required]
        public bool Confirmed { get; set; }

        [Range(0, 20)]
        public short AccompanyingCount { get; set; } = 0;

        [MaxLength(1000)]
        public string? Message { get; set; }
    }
}