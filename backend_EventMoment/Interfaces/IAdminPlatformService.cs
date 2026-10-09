using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    // Vues transverses réservées au Superadmin : contrairement aux autres services,
    // celles-ci ignorent volontairement le filtre "organisateur courant" pour
    // agréger des données sur TOUS les organisateurs de la plateforme.
    public interface IAdminPlatformService
    {
        Task<List<AdminOrganizationDto>> GetOrganizationsAsync();
        Task<AdminOrganizationDto> UpdateOrganizationStatusAsync(Guid organizerId, UpdateOrganizationStatusDto dto);

        Task<List<AdminPlatformEventDto>> GetEventsAsync();
        Task<AdminPlatformEventDto> UpdateEventSuspensionAsync(Guid eventId, UpdateEventSuspensionDto dto, Guid adminId);

        Task<List<AdminModerationItemDto>> GetModerationQueueAsync();
        Task ResolveGuestBookModerationAsync(Guid id, bool keep);
        Task ResolveGalleryModerationAsync(Guid id, bool keep);

        Task<List<AdminTransactionDto>> GetTransactionsAsync();
    }
}
