using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class CreateEventBlockDto
    {
        [Required, MaxLength(100)]
        public string BlockType { get; set; } = string.Empty;

        public short Position { get; set; } = 0;

        public bool IsVisible { get; set; } = true;

        [Required]
        [JsonDocument, MaxLength(50000)]
        public string Content { get; set; } = "{}";
    }
}