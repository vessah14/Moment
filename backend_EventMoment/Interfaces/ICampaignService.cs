using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface ICampaignService
    {
        Task<CampaignDto> CreateAsync(CreateCampaignDto dto, Guid eventId, Guid organizerId);
        Task<List<CampaignDto>> GetAllAsync(Guid eventId, Guid organizerId);
        Task<bool> DeleteAsync(Guid id, Guid organizerId);
    }
}
