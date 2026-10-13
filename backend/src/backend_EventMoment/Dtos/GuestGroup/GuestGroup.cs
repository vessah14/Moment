namespace backend_EventMoment.Dtos
{
    public class GuestGroupDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int GuestsCount { get; set; }
    }
}