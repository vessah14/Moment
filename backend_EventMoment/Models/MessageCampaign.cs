using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    public enum CampaignStatus
    {
        Brouillon,
        Programmee,
        Envoyee
    }

    [Table("message_campaigns")]
    public class MessageCampaign
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [Column("channel")]
        public string Channel { get; set; } = string.Empty;

        [Column("subject")]
        public string? Subject { get; set; }

        [Required]
        [Column("body")]
        public string Body { get; set; } = string.Empty;

        [Required]
        [Column("audience")]
        public string Audience { get; set; } = "Tous les invités";

        [Required]
        [Column("status")]
        public CampaignStatus Status { get; set; } = CampaignStatus.Brouillon;

        [Required]
        [Column("recipient_count")]
        public int RecipientCount { get; set; }

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Column("sent_at")]
        public DateTimeOffset? SentAt { get; set; }

        public Event Event { get; set; } = null!;
    }
}
