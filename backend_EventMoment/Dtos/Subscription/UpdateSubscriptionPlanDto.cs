using System.ComponentModel.DataAnnotations;
using backend_EventMoment.Models;

namespace backend_EventMoment.Dtos
{
    public class UpdateSubscriptionPlanDto
    {
        [Required]
        [MaxLength(100)]
        public string Label { get; set; } = string.Empty;

        [Range(0, int.MaxValue)]
        public int PriceCents { get; set; }

        [Required]
        public PlanBilling Billing { get; set; }

        [JsonDocument]
        public string Features { get; set; } = "{}";

        public bool IsActive { get; set; }
    }
}
