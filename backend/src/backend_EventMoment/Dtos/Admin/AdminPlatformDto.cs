using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class AdminOrganizationDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Plan { get; set; } = "Free";
        public int Events { get; set; }
        public bool IsActive { get; set; }
        public DateTimeOffset JoinedAt { get; set; }
    }

    public class UpdateOrganizationStatusDto
    {
        [Required]
        public bool IsActive { get; set; }
    }

    public class AdminPlatformEventDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int Guests { get; set; }
        public DateOnly? EventDate { get; set; }
    }

    public class UpdateEventSuspensionDto
    {
        [Required]
        public bool Suspended { get; set; }

        [MaxLength(500)]
        public string? Reason { get; set; }
    }

    public class AdminModerationItemDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty; // "Livre d'or" | "Galerie"
        public string Organization { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class AdminTransactionDto
    {
        public Guid Id { get; set; }
        public string Organization { get; set; } = string.Empty;
        public string Plan { get; set; } = string.Empty;
        public int AmountCents { get; set; }
        public DateTimeOffset Date { get; set; }
    }
}
