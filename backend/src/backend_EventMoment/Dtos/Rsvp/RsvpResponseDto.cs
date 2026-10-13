namespace backend_EventMoment.Dtos
{
    public class RsvpResponseDto
    {
        public Guid Id { get; set; }
        public Guid GuestId { get; set; }
        public string GuestFullName { get; set; } = string.Empty;
        public bool? Confirmed { get; set; }
        public short AccompanyingCount { get; set; }
        public string? Message { get; set; }
        public DateTimeOffset? RespondedAt { get; set; }
    }
}