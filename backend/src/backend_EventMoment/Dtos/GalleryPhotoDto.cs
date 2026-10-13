using System.ComponentModel.DataAnnotations;
using backend_EventMoment.Models;

namespace backend_EventMoment.Dtos
{
    public class UpdateGalleryPhotoStatusDto
    {
        [Required]
        public GalleryPhotoStatus Status { get; set; }
    }

    public class GalleryPhotoDto
    {
        public Guid Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public string? Caption { get; set; }
        public string? UploadedBy { get; set; }
        public GalleryPhotoStatus Status { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
