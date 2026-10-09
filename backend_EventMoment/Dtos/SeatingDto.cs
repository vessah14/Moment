using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class CreateEventTableDto
    {
        [Required, MaxLength(100)]
        public string Label { get; set; } = string.Empty;

        [Range(1, 100)]
        public short Capacity { get; set; } = 8;

        public short Position { get; set; } = 0;
    }

    public class EventTableDto
    {
        public Guid Id { get; set; }
        public string Label { get; set; } = string.Empty;
        public short Capacity { get; set; }
        public short Position { get; set; }
        public int AssignedCount { get; set; }
    }

    public class CreateSeatingAssignmentDto
    {
        [Required]
        public Guid GuestId { get; set; }

        [Required]
        public Guid TableId { get; set; }
    }

    // Table vue par les invités (site public) : aucun nom d'invité.
    public class PublicTableDto
    {
        public int Number { get; set; }
        public string Label { get; set; } = string.Empty;
        public short Capacity { get; set; }
    }

    public class PublicSeatResultDto
    {
        public bool Found { get; set; }
        public int? Number { get; set; }
        public string? Label { get; set; }
    }

    public class SeatingAssignmentDto
    {
        public Guid Id { get; set; }
        public Guid GuestId { get; set; }
        public string GuestFullName { get; set; } = string.Empty;
        public Guid TableId { get; set; }
    }
}
