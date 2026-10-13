using backend_EventMoment.Models;

namespace backend_EventMoment.Dtos
{
    public class AdminAccountDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public AdminRole Role { get; set; }
        public bool IsActive { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}