using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IEventStatsService
    {
        Task<EventStatsSummaryDto> GetSummaryAsync(Guid eventId, Guid organizerId);
    }
}
