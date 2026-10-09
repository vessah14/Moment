using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface ISubscriptionPlanService
    {
        Task<SubscriptionPlanDto> CreateAsync(CreateSubscriptionPlanDto dto);
        Task<SubscriptionPlanDto> GetByIdAsync(Guid id);
        Task<List<SubscriptionPlanDto>> GetAllAsync();
        Task<SubscriptionPlanDto> UpdateAsync(Guid id, UpdateSubscriptionPlanDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
