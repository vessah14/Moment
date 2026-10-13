using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class CreateProgramItemDto
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? Speaker { get; set; }
        public string? Location { get; set; }
        public DateTimeOffset? StartTime { get; set; }

        [Range(5, 1440)]
        public int DurationMinutes { get; set; } = 30;

        [Range(1, 100000)]
        public int Capacity { get; set; } = 50;
    }

    public class UpdateProgramItemDto
    {
        public string? Location { get; set; }

        [Range(1, 100000)]
        public int Capacity { get; set; } = 50;

        public bool Notify { get; set; }
    }

    public class ProgramItemDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Speaker { get; set; }
        public string? Location { get; set; }
        public DateTimeOffset? StartTime { get; set; }
        public int DurationMinutes { get; set; }
        public int Capacity { get; set; }
        public bool Notify { get; set; }
    }
}
