using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IPublicSiteService
    {
        Task<PublicSiteDto?> GetPublicSiteAsync(string slug);

        // Sites publiés, non suspendus, dont l'organisateur a activé « Visible sur Google ».
        Task<List<(string Slug, DateTimeOffset LastModified)>> GetSearchableSitesAsync(int max);
    }
}
