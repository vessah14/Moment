using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class SubscribeToPlanDto
    {
        [Required]
        public Guid PlanId { get; set; }
    }
}