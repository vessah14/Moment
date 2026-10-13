using System.ComponentModel.DataAnnotations;
using backend_EventMoment.Models;

namespace backend_EventMoment.Dtos
{
    public class CreateTicketTypeDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Range(0, int.MaxValue)]
        public int PriceCents { get; set; }

        [Range(1, 100000)]
        public int Quota { get; set; }
    }

    public class TicketTypeDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int PriceCents { get; set; }
        public int Quota { get; set; }
        public int SoldCount { get; set; }
    }

    public class RecordTicketSaleDto
    {
        [Required, MaxLength(150)]
        public string BuyerName { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string BuyerEmail { get; set; } = string.Empty;
    }

    public class TicketSaleDto
    {
        public Guid Id { get; set; }
        public Guid TicketTypeId { get; set; }
        public string TicketTypeName { get; set; } = string.Empty;
        public string BuyerName { get; set; } = string.Empty;
        public string BuyerEmail { get; set; } = string.Empty;
        public TicketSaleStatus Status { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
