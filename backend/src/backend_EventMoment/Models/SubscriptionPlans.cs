using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NpgsqlTypes;

namespace backend_EventMoment.Models
{
    // Valeurs à confirmer selon votre CREATE TYPE plan_billing
    public enum PlanBilling
    {
        [PgName("gratuit")]
        Gratuit,
        [PgName("mensuel")]
        Mensuel,
        [PgName("annuel")]
        Annuel
    }

    [Table("subscription_plans")]
    public class SubscriptionPlan
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("code")]
        public string Code { get; set; } = string.Empty;

        [Required]
        [Column("label")]
        public string Label { get; set; } = string.Empty;

        [Required]
        [Column("price_cents")]
        public int PriceCents { get; set; } = 0;

        [Required]
        [Column("currency")]
        public string Currency { get; set; } = "XAF";

        [Required]
        [Column("billing")]
        public PlanBilling Billing { get; set; } = PlanBilling.Gratuit;

        [Required]
        [Column("features", TypeName = "jsonb")]
        public string Features { get; set; } = "{}";

        [Required]
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }
    }
}