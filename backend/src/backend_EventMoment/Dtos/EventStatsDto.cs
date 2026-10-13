namespace backend_EventMoment.Dtos
{
    public class DailyStatDto
    {
        public DateOnly Date { get; set; }
        public int Visits { get; set; }
        public int Shares { get; set; }
    }

    public class EventStatsSummaryDto
    {
        public int TotalGuests { get; set; }
        public int ConfirmedGuests { get; set; }
        public int PendingGuests { get; set; }
        public int RefusedGuests { get; set; }
        public int TotalAccompanying { get; set; }
        public int TotalVisits { get; set; }
        public int TotalShares { get; set; }
        public List<DailyStatDto> Daily { get; set; } = new();
    }
}
