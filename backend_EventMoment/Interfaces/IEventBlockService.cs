using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IEventBlockService
    {
        Task<EventBlockDto> CreateAsync(CreateEventBlockDto dto, Guid eventId, Guid organizerId);
        Task<EventBlockDto> GetByIdAsync(Guid id, Guid organizerId);
        Task<List<EventBlockDto>> GetAllAsync(Guid eventId, Guid organizerId);
        Task<EventBlockDto> UpdateAsync(Guid id, UpdateEventBlockDto dto, Guid organizerId);
        Task<bool> DeleteAsync(Guid id, Guid organizerId);
    }
}
