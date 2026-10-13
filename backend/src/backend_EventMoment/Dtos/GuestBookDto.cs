using System.ComponentModel.DataAnnotations;
using backend_EventMoment.Models;

namespace backend_EventMoment.Dtos
{
    public class CreateGuestBookEntryDto
    {
        [Required, MaxLength(150)]
        public string AuthorName { get; set; } = string.Empty;

        [Required, MaxLength(2000)]
        public string Message { get; set; } = string.Empty;
    }

    public class UpdateGuestBookStatusDto
    {
        [Required]
        public GuestBookStatus Status { get; set; }
    }

    public class ReplyGuestBookEntryDto
    {
        [Required, MaxLength(2000)]
        public string Reply { get; set; } = string.Empty;
    }

    public class GuestBookEntryDto
    {
        public Guid Id { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public GuestBookStatus Status { get; set; }
        public string? Reply { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
