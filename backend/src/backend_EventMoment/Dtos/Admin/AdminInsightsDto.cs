namespace backend_EventMoment.Dtos;

// Graphiques de la console : une ligne par jour (heure du Cameroun), de la plus ancienne
// à la plus récente, jours sans activité compris.
public sealed class AdminTimeSeriesPointDto
{
    public DateOnly Date { get; set; }
    public int Signups { get; set; }
    public int EventsCreated { get; set; }
    public int EventsPublished { get; set; }
    public int Guests { get; set; }
    public int Rsvps { get; set; }
    public int Visits { get; set; }
    public int Shares { get; set; }
    public int Revenue { get; set; }
}

// Fiche d'une organisation : tout ce qu'il faut pour aider un client en deux minutes.
public sealed class AdminOrganizationDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public bool IsActive { get; set; }
    public bool EmailVerified { get; set; }
    public DateTimeOffset JoinedAt { get; set; }
    public string PlanCode { get; set; } = "free";
    public string PlanLabel { get; set; } = "Free";
    public DateTimeOffset? PlanEndsAt { get; set; }
    public List<AdminOrganizationEventDto> Events { get; set; } = [];
    public List<AdminOrganizationPaymentDto> Payments { get; set; } = [];
    public List<AdminOrganizationSubscriptionDto> Subscriptions { get; set; } = [];
    public List<AdminPlanOptionDto> AvailablePlans { get; set; } = [];
}

public sealed class AdminOrganizationEventDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateOnly? EventDate { get; set; }
    public int Guests { get; set; }
    public int Confirmed { get; set; }
    public int Visits { get; set; }
    public bool Suspended { get; set; }
}

public sealed class AdminOrganizationPaymentDto
{
    public string PlanLabel { get; set; } = string.Empty;
    public int Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
}

public sealed class AdminOrganizationSubscriptionDto
{
    public string PlanLabel { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? EndsAt { get; set; }
    public bool Paid { get; set; }
}

public sealed class AdminPlanOptionDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
}

public sealed class AdminGrantPlanDto
{
    public Guid PlanId { get; set; }

    [System.ComponentModel.DataAnnotations.Range(1, 366)]
    public int Days { get; set; } = 30;
}
