using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models;

// Existing payment records are preserved by the provider-name migration.
[Table("kpay_payments")]
public class KPayPayment
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
    [MaxLength(100)]
    [Column("transaction_id")]
    public string? TransactionId { get; set; }
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
