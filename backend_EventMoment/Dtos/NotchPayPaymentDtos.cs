using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend_EventMoment.Dtos;

public class CreateNotchPayCheckoutDto
{
    [Required]
    public Guid PlanId { get; set; }
}

public class NotchPayCheckoutDto
{
    public Guid PaymentId { get; set; }
    public string CheckoutUrl { get; set; } = string.Empty;
}

public class NotchPayPaymentStatusDto
{
    public Guid PaymentId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PlanLabel { get; set; } = string.Empty;
    public int Amount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
}

public class NotchPayWebhookDto
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;
    [JsonPropertyName("data")]
    public NotchPayWebhookData Data { get; set; } = new();
}

public class NotchPayWebhookData
{
    [JsonPropertyName("reference")]
    public string Reference { get; set; } = string.Empty;
}