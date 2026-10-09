using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IUserSubscriptionService
    {
        Task<UserSubscriptionDto> SubscribeAsync(Guid organizerId, Guid planId, SubscribeToPlanDto dto);
        Task<UserSubscriptionDto> GetByIdAsync(Guid id, Guid organizerId);
        Task<List<UserSubscriptionDto>> GetAllAsync(Guid organizerId);
        Task<UserSubscriptionDto> ChangePlanAsync(Guid id, ChangePlanDto dto, Guid organizerId);
        Task<UserSubscriptionDto> CancelAsync(Guid id, CancelSubscriptionDto dto, Guid organizerId);
    }
}
