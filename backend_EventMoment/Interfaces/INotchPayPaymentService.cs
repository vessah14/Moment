using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces;

public interface INotchPayPaymentService
{
    Task<NotchPayCheckoutDto> CreateCheckoutAsync(Guid organizerId, Guid planId);
    Task<NotchPayPaymentStatusDto> GetStatusAsync(Guid paymentId, Guid organizerId);
    Task<bool> HandleWebhookAsync(string reference);
}