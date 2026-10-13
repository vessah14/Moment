namespace backend_EventMoment.Dtos
{
    public class EventBlockDto
    {
        public Guid Id { get; set; }
        public string BlockType { get; set; } = string.Empty;
        public short Position { get; set; }
        public bool IsVisible { get; set; }
        public string Content { get; set; } = "{}";
    }
}