using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface ITicketingService
    {
        Task<TicketTypeDto> CreateTypeAsync(CreateTicketTypeDto dto, Guid eventId, Guid organizerId);
        Task<List<TicketTypeDto>> GetTypesAsync(Guid eventId, Guid organizerId);
        Task<bool> DeleteTypeAsync(Guid id, Guid organizerId);

        Task<TicketSaleDto> RecordSaleAsync(Guid ticketTypeId, RecordTicketSaleDto dto, Guid organizerId);
        Task<List<TicketSaleDto>> GetSalesAsync(Guid eventId, Guid organizerId);
    }
}
