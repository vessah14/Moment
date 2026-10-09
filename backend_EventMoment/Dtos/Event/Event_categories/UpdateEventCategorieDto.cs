using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class UpdateEventCategoryDto
    {
        [Required]
        public string Label { get; set; } = string.Empty;

        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }
}