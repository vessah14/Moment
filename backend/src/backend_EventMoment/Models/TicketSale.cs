using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    public enum TicketSaleStatus
    {
        EnAttente,
        Payee,
        Annulee
    }

    [Table("ticket_sales")]
    public class TicketSale
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("ticket_type_id")]
        public Guid TicketTypeId { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [Column("buyer_name")]
        public string BuyerName { get; set; } = string.Empty;

        [Required]
        [Column("buyer_email")]
        public string BuyerEmail { get; set; } = string.Empty;

        [Required]
        [Column("status")]
        public TicketSaleStatus Status { get; set; } = TicketSaleStatus.Payee;

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        public TicketType TicketType { get; set; } = null!;
        public Event Event { get; set; } = null!;
    }
}
