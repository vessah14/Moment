using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    public enum GalleryPhotoStatus
    {
        EnAttente,
        Publie,
        Refuse
    }

    [Table("gallery_photos")]
    public class GalleryPhoto
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [Column("url")]
        public string Url { get; set; } = string.Empty;

        [Column("caption")]
        public string? Caption { get; set; }

        [Column("uploaded_by")]
        public string? UploadedBy { get; set; }

        [Required]
        [Column("status")]
        public GalleryPhotoStatus Status { get; set; } = GalleryPhotoStatus.EnAttente;

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        public Event Event { get; set; } = null!;
    }
}
