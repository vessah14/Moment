using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    public enum PlatformReviewStatus
    {
        EnAttente,
        Publie,
        Refuse
    }

    // Avis d'un organisateur sur TBF Moment (un par organisateur). Affiché sur l'accueil
    // uniquement après validation par l'admin ; toute modification le repasse en attente.
    [Table("platform_reviews")]
    public class PlatformReview
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("organizer_id")]
        public Guid OrganizerId { get; set; }

        [Column("rating")]
        public short Rating { get; set; }

        [MaxLength(1000)]
        [Column("comment")]
        public string Comment { get; set; } = string.Empty;

        [MaxLength(80)]
        [Column("display_name")]
        public string DisplayName { get; set; } = string.Empty;

        [MaxLength(80)]
        [Column("context")]
        public string? Context { get; set; }

        [Column("status")]
        public PlatformReviewStatus Status { get; set; } = PlatformReviewStatus.EnAttente;

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; }

        [Column("moderated_at")]
        public DateTimeOffset? ModeratedAt { get; set; }
    }
}
