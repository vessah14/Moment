using backend_EventMoment.Dtos;
using backend_EventMoment.Models;

namespace backend_EventMoment.Interfaces
{
    public interface IGuestService
    {
        Task<GuestDTO> CreateAsync(CreateGuestDto dto, Guid eventId, Guid organizerId, Guid? groupId = null);
        Task<GuestDTO> GetByIdAsync(Guid id, Guid organizerId);
        Task<List<GuestDTO>> GetAllAsync(Guid organizerId, Guid? eventId = null);
        Task<List<GuestEventStatsDto>> GetEventStatsAsync(Guid organizerId, Guid? eventId = null);
        Task<GuestDTO> UpdateAsync(Guid id, UpdateGuestDto dto, Guid organizerId);
        Task<bool> DeleteAsync(Guid id, Guid organizerId);
        Task<GuestDTO> CheckInAsync(Guid id, Guid organizerId);
        Task<GuestDTO> UndoCheckInAsync(Guid id, Guid organizerId);
        Task<GuestDTO> QueueInvitationAsync(Guid id, Guid organizerId);
        Task<int> QueuePendingInvitationsAsync(Guid eventId, Guid organizerId);

        Task<PublicInvitationDto?> GetPublicInvitationAsync(Guid guestId);
        Task<PublicInvitationDto?> SubmitPublicRsvpAsync(Guid guestId, SubmitPublicRsvpDto dto);
        Task<PublicInvitationDto?> SubmitPublicEventRsvpAsync(string slug, SubmitPublicEventRsvpDto dto);
    }
}
