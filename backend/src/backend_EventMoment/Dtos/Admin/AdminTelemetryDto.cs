namespace backend_EventMoment.Dtos;

public sealed class AdminDashboardDto
{
    public int ActiveOrganizations { get; set; }
    public int TotalEvents { get; set; }
    public int PublishedEvents { get; set; }
    public int DraftEvents { get; set; }
    public int TotalGuests { get; set; }
    public int ModerationAlerts { get; set; }
    public int ErrorsLast24Hours { get; set; }
    public int FailedPayments { get; set; }
    public bool KPayEnabled { get; set; }
    public List<AdminFunnelStepDto> Funnel { get; set; } = [];
    public AdminDashboardTrendDto Trends { get; set; } = new();
    public List<AdminUpcomingEventDto> UpcomingEvents { get; set; } = [];
}

public sealed class AdminFunnelStepDto
{
    public string Label { get; set; } = string.Empty;
    public int Organizations { get; set; }
}

public sealed class AdminDashboardTrendDto
{
    public int Organizations { get; set; }
    public int Events { get; set; }
    public int PublishedEvents { get; set; }
    public int Guests { get; set; }
    public int Rsvps { get; set; }
}

public sealed class AdminUpcomingEventDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Organization { get; set; } = string.Empty;
    public DateOnly EventDate { get; set; }
    public int Guests { get; set; }
}

public sealed class AdminSystemHealthDto
{
    public bool ApiAvailable { get; set; } = true;
    public bool DatabaseAvailable { get; set; }
    public DateTimeOffset CheckedAt { get; set; }
    public int ErrorsLast24Hours { get; set; }
    public List<AdminTechnicalErrorDto> RecentErrors { get; set; } = [];
}

public sealed class AdminTechnicalErrorDto
{
    public string Category { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class AdminActivityDto
{
    public string AdminEmail { get; set; } = string.Empty;
    public string HttpMethod { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}
