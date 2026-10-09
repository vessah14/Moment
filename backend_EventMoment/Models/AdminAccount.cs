using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NpgsqlTypes;

namespace backend_EventMoment.Models
{
    public enum AdminRole
    {
        [PgName("support")]
        Support,

        [PgName("superadmin")]
        Superadmin
    }

    [Table("admin_accounts")]
    public class AdminAccount
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("email", TypeName = "citext")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [Column("role")]
        public AdminRole Role { get; set; } = AdminRole.Support;

        [Required]
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_by")]
        public Guid? CreatedBy { get; set; }

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Required]
        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; }


        // Navigation vers l'admin qui a créé ce compte (auto-référence)
        [ForeignKey("CreatedBy")]
        public AdminAccount? CreatedByAdmin { get; set; }
    }
}