using backend_EventMoment.Dtos.Event;

namespace backend_EventMoment.Interfaces
{
    public interface IEventLocationService
    {
        Task<EventLocationDto> CreateAsync(CreateEventLocationDto dto, Guid eventId, Guid organizerId);
        Task<EventLocationDto> GetByIdAsync(Guid id, Guid organizerId);
        Task<List<EventLocationDto>> GetAllAsync(Guid eventId, Guid organizerId);
        Task<EventLocationDto> UpdateAsync(Guid id, UpdateEventLocationDto dto, Guid organizerId);
        Task<bool> DeleteAsync(Guid id, Guid organizerId);
    }
}
