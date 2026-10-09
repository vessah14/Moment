using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class CreateSpeakerDto
    {
        [Required, MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        public string? Title { get; set; }
        public string? Topic { get; set; }
    }

    public class SpeakerDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Topic { get; set; }
    }

    public class CreateConferenceSessionDto
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Room { get; set; }
        public Guid? SpeakerId { get; set; }
        public DateTimeOffset? StartTime { get; set; }
    }

    public class ConferenceSessionDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Room { get; set; }
        public Guid? SpeakerId { get; set; }
        public string? SpeakerName { get; set; }
        public DateTimeOffset? StartTime { get; set; }
    }

    public class CreateSponsorDto
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Tier { get; set; } = "Standard";
    }

    public class SponsorDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Tier { get; set; } = string.Empty;
    }
}
