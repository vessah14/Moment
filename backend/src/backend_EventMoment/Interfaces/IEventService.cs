using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IEventService
    {
        Task<EventDto> CreateAsync(CreateEventDto dto, Guid organizerId);
        Task<EventDto> GetByIdAsync(Guid id, Guid organizerId);
        Task<List<EventDto>> GetAllAsync(Guid organizerId);
        Task<EventDto> UpdateAsync(Guid id, UpdateEventDto dto, Guid organizerId);
        Task<bool> DeleteAsync(Guid id, Guid organizerId);
    }
}
