using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models;

// Paiement d'abonnement en ligne. La table garde son nom historique (kpay_payments) :
// changer de prestataire (NotchPay, KPay, puis SasPay) ne demande aucune migration.
[Table("kpay_payments")]
public class SubscriptionPayment
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
    [Required, MaxLength(100)]
    [Column("external_id")]
    public string ExternalId { get; set; } = string.Empty;
    [Column("idempotency_key")]
    public Guid? IdempotencyKey { get; set; }
    // Identifiant de la session de paiement SasPay (colonne historique transaction_id).
    // Identifiant de la session de paiement SasPay (colonne historique transaction_id).
    [MaxLength(100)]
    [Column("transaction_id")]
    public string? SessionId { get; set; }
    [Required, MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = "PENDING";
    [Required]
    [Column("amount")]
    public int Amount { get; set; }
    [MaxLength(2048)]
    [Column("checkout_url")]
    public string? CheckoutUrl { get; set; }
    [Required]
    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    [Required]
    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    [Column("paid_at")]
    public DateTimeOffset? PaidAt { get; set; }
    public SubscriptionPlan? Plan { get; set; }
}
