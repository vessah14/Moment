using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NpgsqlTypes;

namespace backend_EventMoment.Models
{
    // Valeurs à confirmer selon votre CREATE TYPE subscription_status
    public enum SubscriptionStatus
    {
        [PgName("actif")]
        Actif,
        [PgName("expire")]
        Expire,
        [PgName("annule")]
        Annule,
        [PgName("essai")]
        Essai
    }

    [Table("organizer_subscriptions")]
    public class UserSubscription
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("organizer_id")]
        public Guid OrganizerId { get; set; }

        [Required]
        [Column("plan_id")]
        public Guid PlanId { get; set; }

        [Required]
        [Column("status")]
        public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Actif;

        [Required]
        [Column("started_at")]
        public DateTimeOffset StartedAt { get; set; }

        [Column("ends_at")]
        public DateTimeOffset? EndsAt { get; set; }

        [Column("kpay_payment_id")]
        public Guid? KPayPaymentId { get; set; }

        // Navigation
        public SubscriptionPlan Plan { get; set; } = null!;
        // Navigation vers Organizer si la classe existe déjà
        // public Organizer Organizer { get; set; } = null!;
    }
}