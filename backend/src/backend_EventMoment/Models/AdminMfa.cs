using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models
{
    // Double authentification d'un compte d'administration (application TOTP).
    [Table("admin_mfa")]
    public class AdminMfa
    {
        [Key]
        [Column("admin_id")]
        public Guid AdminId { get; set; }

        // Secret chiffré (Data Protection) : la base seule ne permet pas de générer les codes.
        [Column("secret_protected")]
        public string SecretProtected { get; set; } = string.Empty;

        // Null tant que l'administrateur n'a pas confirmé un premier code.
        [Column("enabled_at")]
        public DateTimeOffset? EnabledAt { get; set; }

        [Column("last_used_step")]
        public long LastUsedStep { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
