using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces;

public interface INotchPayPaymentService
{
    Task<NotchPayCheckoutDto> CreateCheckoutAsync(Guid organizerId, Guid planId);
    Task<NotchPayPaymentStatusDto> GetStatusAsync(Guid paymentId, Guid organizerId);
    // notchReference : référence Notch Pay (« trx.… ») ; merchantReference : la nôtre (trxref).
    Task<bool> HandleWebhookAsync(string notchReference, string? merchantReference = null);
}