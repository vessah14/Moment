using backend_EventMoment.Models;

namespace backend_EventMoment.Dtos
{
    public class UserSubscriptionDto
    {
        public Guid Id { get; set; }
        public SubscriptionStatus Status { get; set; }
        public DateTimeOffset StartedAt { get; set; }
        public DateTimeOffset? EndsAt { get; set; }

        // Infos du plan aplaties, pratique pour le frontend
        public string PlanCode { get; set; } = string.Empty;
        public string PlanLabel { get; set; } = string.Empty;
        public int PriceCents { get; set; }
        public PlanBilling Billing { get; set; }
    }
}