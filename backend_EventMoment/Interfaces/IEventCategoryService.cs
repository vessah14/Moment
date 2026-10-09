using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IEventCategoryService
    {
        Task<EventCategoryDto> CreateAsync(CreateEventCategoryDto dto);
        Task<EventCategoryDto> GetByIdAsync(Guid id);
        Task<List<EventCategoryDto>> GetAllAsync();
        Task<EventCategoryDto> UpdateAsync(Guid id, UpdateEventCategoryDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
