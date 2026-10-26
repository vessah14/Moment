namespace backend_EventMoment.Dtos
{
    public class GuestEventStatsDto
    {
        public Guid EventId { get; set; }
        public int TotalCount { get; set; }
        public int ConfirmedCount { get; set; }
        public int PendingCount { get; set; }
        public int DeclinedCount { get; set; }
    }
}
