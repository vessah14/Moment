using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class CreateEventCategoryDto
    {
        [Required]
        public string Code { get; set; } = string.Empty;

        [Required]
        public string Label { get; set; } = string.Empty;

        public string? Description { get; set; }
    }
}