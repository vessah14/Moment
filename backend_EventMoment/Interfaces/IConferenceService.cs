using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IConferenceService
    {
        Task<SpeakerDto> CreateSpeakerAsync(CreateSpeakerDto dto, Guid eventId, Guid organizerId);
        Task<List<SpeakerDto>> GetSpeakersAsync(Guid eventId, Guid organizerId);
        Task<bool> DeleteSpeakerAsync(Guid id, Guid organizerId);

        Task<ConferenceSessionDto> CreateSessionAsync(CreateConferenceSessionDto dto, Guid eventId, Guid organizerId);
        Task<List<ConferenceSessionDto>> GetSessionsAsync(Guid eventId, Guid organizerId);
        Task<bool> DeleteSessionAsync(Guid id, Guid organizerId);

        Task<SponsorDto> CreateSponsorAsync(CreateSponsorDto dto, Guid eventId, Guid organizerId);
        Task<List<SponsorDto>> GetSponsorsAsync(Guid eventId, Guid organizerId);
        Task<bool> DeleteSponsorAsync(Guid id, Guid organizerId);
    }
}
