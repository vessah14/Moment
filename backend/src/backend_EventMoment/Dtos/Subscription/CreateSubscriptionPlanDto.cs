using System.ComponentModel.DataAnnotations;
using backend_EventMoment.Models;

namespace backend_EventMoment.Dtos
{
    public class CreateSubscriptionPlanDto
    {
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Label { get; set; } = string.Empty;

        [Range(0, int.MaxValue)]
        public int PriceCents { get; set; } = 0;

        [Required]
        public string Currency { get; set; } = "XAF";

        [Required]
        public PlanBilling Billing { get; set; }

        [JsonDocument]
        public string Features { get; set; } = "{}";
    }
}
