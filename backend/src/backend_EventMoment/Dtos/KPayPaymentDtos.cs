using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos;

public class CreateKPayCheckoutDto
{
    [Required]
    public Guid PlanId { get; set; }
}

public class KPayCheckoutDto
{
    public Guid PaymentId { get; set; }
    public string CheckoutUrl { get; set; } = string.Empty;
}

public class KPayPaymentStatusDto
{
    public Guid PaymentId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PlanLabel { get; set; } = string.Empty;
    public int Amount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
}
