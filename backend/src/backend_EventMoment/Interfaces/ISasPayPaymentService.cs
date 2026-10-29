using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces;

public interface ISasPayPaymentService
{
    Task<SasPayCheckoutDto> CreateCheckoutAsync(Guid organizerId, Guid planId, Guid idempotencyKey);
    Task<SasPayPaymentStatusDto> GetStatusAsync(Guid paymentId, Guid organizerId);
    Task<bool> HandleTransactionSuccessAsync(string transactionId, decimal amount, string currency);
}
