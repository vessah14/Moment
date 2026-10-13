using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NpgsqlTypes;

namespace backend_EventMoment.Models
{
    public enum GuestStatus
    {
        [PgName("present")]
        Present,
        [PgName("absent")]
        Absent,
        [PgName("en_attente")]
        EnAttente
    }
    [Table("guests")]
    public class Guest
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Column("group_id")]
        public Guid? GroupId { get; set; }

        [Required]
        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [Column("phone")]
        public string? Phone { get; set; }

        [Column("email", TypeName = "citext")]
        public string? Email { get; set; }

        [Required]
        [Column("status")]
        public GuestStatus Status { get; set; } = GuestStatus.EnAttente;

        [Column("import_batch_id")]
        public Guid? ImportBatchId { get; set; }

        [Required]
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Required]
        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; }

        // Navigation vers Event
        public Event Event { get; set; } = null!;

        // Navigation vers GuestGroup (nullable, car group_id est optionnel)
        public Guest_group? GuestGroup { get; set; }


    }
}