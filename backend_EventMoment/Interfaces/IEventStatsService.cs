using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public enum EventStatKind { Visit, Share }

    public interface IEventStatsService
    {
        Task<EventStatsSummaryDto> GetSummaryAsync(Guid eventId, Guid organizerId);

        // Compte une visite ou un partage du site public (événement publié, non suspendu).
        // Retourne false si l'événement n'existe pas ou n'est pas en ligne.
        Task<bool> RecordAsync(string slug, EventStatKind kind);
    }
}
