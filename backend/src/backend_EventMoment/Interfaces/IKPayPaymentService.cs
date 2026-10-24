using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces;

public interface IKPayPaymentService
{
    Task<KPayCheckoutDto> CreateCheckoutAsync(Guid organizerId, Guid planId, Guid idempotencyKey);
    Task<KPayPaymentStatusDto> GetStatusAsync(Guid paymentId, Guid organizerId);
    Task<bool> HandleWebhookAsync(string paymentId, string externalId, string status, decimal amount);
}
