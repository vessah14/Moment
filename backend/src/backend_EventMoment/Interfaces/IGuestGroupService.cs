using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IGuestGroupService
    {
        Task<GuestGroupDto> CreateAsync(CreateGuestGroupDto dto, Guid eventId, Guid organizerId);
        Task<GuestGroupDto> GetByIdAsync(Guid id, Guid organizerId);
        Task<List<GuestGroupDto>> GetAllAsync(Guid eventId, Guid organizerId);
        Task<GuestGroupDto> UpdateAsync(Guid id, UpdateGuestGroupDto dto, Guid organizerId);
        Task<bool> DeleteAsync(Guid id, Guid organizerId);
    }
}
