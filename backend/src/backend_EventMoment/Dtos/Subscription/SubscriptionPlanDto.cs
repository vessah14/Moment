using backend_EventMoment.Models;

namespace backend_EventMoment.Dtos
{
    public class SubscriptionPlanDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public int PriceCents { get; set; }
        public string Currency { get; set; } = "XAF";
        public PlanBilling Billing { get; set; }
        public string Features { get; set; } = "{}";
    }
}