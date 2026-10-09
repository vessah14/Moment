using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IGiftRegistryService
    {
        Task<GiftItemDto> CreateAsync(CreateGiftItemDto dto, Guid eventId, Guid organizerId);
        Task<List<GiftItemDto>> GetAllAsync(Guid eventId, Guid organizerId);
        Task<bool> DeleteAsync(Guid id, Guid organizerId);

        Task<PublicEventDto?> GetPublicEventAsync(string slug);
        Task<List<GiftItemDto>> GetPublicGiftsAsync(string slug);
        Task<GiftItemDto?> ReserveAsync(Guid giftId, ReserveGiftDto dto);
    }
}
