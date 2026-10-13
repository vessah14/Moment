using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface ISeatingService
    {
        Task<EventTableDto> CreateTableAsync(CreateEventTableDto dto, Guid eventId, Guid organizerId);
        Task<List<EventTableDto>> GetTablesAsync(Guid eventId, Guid organizerId);
        Task<bool> DeleteTableAsync(Guid id, Guid organizerId);

        Task<SeatingAssignmentDto> AssignGuestAsync(CreateSeatingAssignmentDto dto, Guid eventId, Guid organizerId);
        Task<List<SeatingAssignmentDto>> GetAssignmentsAsync(Guid eventId, Guid organizerId);
        Task<bool> UnassignGuestAsync(Guid guestId, Guid organizerId);
    }
}
