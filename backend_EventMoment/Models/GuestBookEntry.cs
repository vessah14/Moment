using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    public enum GuestBookStatus
    {
        EnAttente,
        Publie,
        Signale,
        Masque
    }

    [Table("guest_book_entries")]
    public class GuestBookEntry
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [Column("author_name")]
        public string AuthorName { get; set; } = string.Empty;

        [Required]
        [Column("message")]
        public string Message { get; set; } = string.Empty;

        [Required]
        [Column("status")]
        public GuestBookStatus Status { get; set; } = GuestBookStatus.EnAttente;

        [Column("reply")]
        public string? Reply { get; set; }

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        public Event Event { get; set; } = null!;
    }
}
