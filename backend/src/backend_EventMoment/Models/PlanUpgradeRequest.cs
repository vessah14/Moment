using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    public enum UpgradeRequestStatus
    {
        EnAttente,
        Approuvee,
        Refusee,
        Annulee
    }

    // Demande de passage à une offre payante. Aucun paiement en ligne : l'organisateur
    // paie hors ligne (Mobile Money) et l'admin active l'offre depuis sa console.
    [Table("plan_upgrade_requests")]
    public class PlanUpgradeRequest
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("organizer_id")]
        public Guid OrganizerId { get; set; }

        [Column("plan_id")]
        public Guid PlanId { get; set; }

        [Column("status")]
        public UpgradeRequestStatus Status { get; set; } = UpgradeRequestStatus.EnAttente;

        [MaxLength(30)]
        [Column("phone")]
        public string? Phone { get; set; }

        [MaxLength(1000)]
        [Column("message")]
        public string? Message { get; set; }

        [MaxLength(500)]
        [Column("admin_note")]
        public string? AdminNote { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Column("handled_at")]
        public DateTimeOffset? HandledAt { get; set; }

        [Column("handled_by")]
        public Guid? HandledBy { get; set; }

        public SubscriptionPlan Plan { get; set; } = null!;
    }
}
