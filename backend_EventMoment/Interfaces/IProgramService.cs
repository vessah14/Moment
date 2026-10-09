using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IProgramService
    {
        Task<ProgramItemDto> CreateAsync(CreateProgramItemDto dto, Guid eventId, Guid organizerId);
        Task<List<ProgramItemDto>> GetAllAsync(Guid eventId, Guid organizerId);
        Task<ProgramItemDto> UpdateAsync(Guid id, UpdateProgramItemDto dto, Guid organizerId);
        Task<ProgramItemDto> ToggleNotifyAsync(Guid id, Guid organizerId);
        Task<bool> DeleteAsync(Guid id, Guid organizerId);
    }
}
