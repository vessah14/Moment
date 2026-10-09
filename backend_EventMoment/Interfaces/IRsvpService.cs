using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IRsvpService
    {
        Task<RsvpResponseDto> CreateAsync(CreateRsvpResponseDto dto, Guid guestId, Guid eventId, Guid organizerId);
        Task<RsvpResponseDto> GetByIdAsync(Guid id, Guid organizerId);
        Task<List<RsvpResponseDto>> GetAllAsync(Guid organizerId, Guid? eventId = null, Guid? guestId = null);
        Task<RsvpResponseDto> UpdateAsync(Guid id, UpdateRsvpResponseDto dto, Guid organizerId);
        Task<bool> DeleteAsync(Guid id, Guid organizerId);
    }
}
