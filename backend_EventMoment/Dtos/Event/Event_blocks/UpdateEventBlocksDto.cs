using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class UpdateEventBlockDto
    {
        [Required, MaxLength(100)]
        public string BlockType { get; set; } = string.Empty;

        public short Position { get; set; }

        public bool IsVisible { get; set; }

        [Required]
        [JsonDocument, MaxLength(50000)]
        public string Content { get; set; } = "{}";
    }
}