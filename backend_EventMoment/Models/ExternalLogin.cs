using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    [Table("external_logins")]
    public class ExternalLogin
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("organizer_id")]
        public Guid OrganizerId { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("provider")]
        public string Provider { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [Column("provider_user_id")]
        public string ProviderUserId { get; set; } = string.Empty;

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        public Utilisateur Organizer { get; set; } = null!;
    }
}
