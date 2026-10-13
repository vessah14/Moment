using System.ComponentModel.DataAnnotations;

namespace backend_EventMoment.Dtos
{
    public class UpdateGuestGroupDto
    {
        [Required, MaxLength(255)]
        public string Name { get; set; } = string.Empty;
    }
}