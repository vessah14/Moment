using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_EventMoment.Models;

[Table("admin_activity_logs")]
public sealed class AdminActivityLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("admin_id")]
    public Guid? AdminId { get; set; }

    [Required]
    [MaxLength(320)]
    [Column("admin_email")]
    public string AdminEmail { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    [Column("http_method")]
    public string HttpMethod { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    [Column("route")]
    public string Route { get; set; } = string.Empty;

    [Required]
    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
}

[Table("technical_error_logs")]
public sealed class TechnicalErrorLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("category")]
    public string Category { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    [Column("route")]
    public string Route { get; set; } = string.Empty;

    [Required]
    [Column("status_code")]
    public int StatusCode { get; set; }

    [Required]
    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
}
