using System.ComponentModel.DataAnnotations;
using backend_EventMoment.Models;

namespace backend_EventMoment.Dtos
{
    public class EventDto
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Slug { get; set; } = string.Empty;

        [Required]
        public Guid CategoryId { get; set; }

        public EventStatus Status { get; set; } = EventStatus.Brouillon;

        public DateOnly? EventDate { get; set; }

        public TimeOnly? StartTime { get; set; }

        public string? CoverImageUrl { get; set; }

        public string? ThemeColor { get; set; }

        public string? ThemeFont { get; set; }

        public string CustomFields { get; set; } = "{}";

        // Suspendu par la modération : le site public et les invitations sont masqués.
        public bool IsSuspended { get; set; }

        public string? SuspensionReason { get; set; }
    }
}