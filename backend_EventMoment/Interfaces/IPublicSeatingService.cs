using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IPublicSeatingService
    {
        // null : événement non publié, suspendu, ou sans bloc « Plan de table ».
        Task<List<PublicTableDto>?> GetTablesAsync(string slug);

        Task<PublicSeatResultDto?> FindSeatAsync(string slug, string name);
    }
}
