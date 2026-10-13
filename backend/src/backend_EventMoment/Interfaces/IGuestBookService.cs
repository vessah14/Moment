using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IGuestBookService
    {
        Task<GuestBookEntryDto> CreateAsync(CreateGuestBookEntryDto dto, Guid eventId, Guid organizerId);
        Task<List<GuestBookEntryDto>> GetAllAsync(Guid eventId, Guid organizerId);
        Task<GuestBookEntryDto> UpdateStatusAsync(Guid id, UpdateGuestBookStatusDto dto, Guid organizerId);
        Task<GuestBookEntryDto> ReplyAsync(Guid id, ReplyGuestBookEntryDto dto, Guid organizerId);
        Task<bool> DeleteAsync(Guid id, Guid organizerId);

        // Message laissé par un invité depuis le mini-site public (null = livre d'or indisponible).
        Task<bool> CreatePublicAsync(string slug, CreateGuestBookEntryDto dto);
    }
}
