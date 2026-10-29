using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services;

// Console superadmin : courbes d'activité de la plateforme, fiche détaillée d'une
// organisation, et attribution manuelle d'une offre (geste commercial, paiement reçu hors
// SasPay). Toutes les lectures ignorent les filtres organisateur : vue transverse.
public sealed class AdminInsightsService
{
    public const int MinDays = 7;
    public const int MaxDays = 365;
    // Les jours sont comptés à l'heure du Cameroun (UTC+1, sans heure d'été).
    private static readonly TimeSpan Douala = TimeSpan.FromHours(1);

    private readonly AdminDbContext _context;

    public AdminInsightsService(AdminDbContext context)
    {
        _context = context;
    }

    private static DateOnly LocalDate(DateTimeOffset value) => DateOnly.FromDateTime(value.ToOffset(Douala).DateTime);

    public async Task<List<AdminTimeSeriesPointDto>> GetTimeSeriesAsync(int days, CancellationToken cancellationToken)
    {
        days = Math.Clamp(days, MinDays, MaxDays);
        var today = LocalDate(DateTimeOffset.UtcNow);
        var firstDay = today.AddDays(1 - days);
        var since = new DateTimeOffset(firstDay.ToDateTime(TimeOnly.MinValue), Douala).ToUniversalTime();

        // Petits volumes : les horodatages sont relus puis regroupés ici, ce qui reste exact
        // quelle que soit la base (et le fuseau du serveur).
        var signups = await _context.Organizers.IgnoreQueryFilters().AsNoTracking()
            .Where(o => o.CreatedAt >= since).Select(o => o.CreatedAt).ToListAsync(cancellationToken);
        var created = await _context.Events.IgnoreQueryFilters().AsNoTracking()
            .Where(e => e.CreatedAt >= since).Select(e => e.CreatedAt).ToListAsync(cancellationToken);
        var published = await _context.Events.IgnoreQueryFilters().AsNoTracking()
            .Where(e => e.PublishedAt != null && e.PublishedAt >= since).Select(e => e.PublishedAt!.Value).ToListAsync(cancellationToken);
        var guests = await _context.Guests.IgnoreQueryFilters().AsNoTracking()
            .Where(g => g.CreatedAt >= since).Select(g => g.CreatedAt).ToListAsync(cancellationToken);
        var rsvps = await _context.RsvpResponses.IgnoreQueryFilters().AsNoTracking()
            .Where(r => r.RespondedAt != null && r.RespondedAt >= since).Select(r => r.RespondedAt!.Value).ToListAsync(cancellationToken);
        var stats = await _context.EventStatsDailies.IgnoreQueryFilters().AsNoTracking()
            .Where(s => s.StatDate >= firstDay)
            .GroupBy(s => s.StatDate)
            .Select(g => new { Date = g.Key, Visits = g.Sum(s => s.VisitsCount), Shares = g.Sum(s => s.SharesCount) })
            .ToListAsync(cancellationToken);
        var payments = AdminDbContext.SasPayEnabled
            ? await _context.SubscriptionPayments.IgnoreQueryFilters().AsNoTracking()
                .Where(p => p.PaidAt != null && p.PaidAt >= since)
                .Select(p => new { PaidAt = p.PaidAt!.Value, p.Amount })
                .ToListAsync(cancellationToken)
            : [];

        Dictionary<DateOnly, int> CountByDay(IEnumerable<DateTimeOffset> values) =>
            values.GroupBy(LocalDate).ToDictionary(g => g.Key, g => g.Count());
        var signupsByDay = CountByDay(signups);
        var createdByDay = CountByDay(created);
        var publishedByDay = CountByDay(published);
        var guestsByDay = CountByDay(guests);
        var rsvpsByDay = CountByDay(rsvps);
        var statsByDay = stats.ToDictionary(s => s.Date);
        var revenueByDay = payments.GroupBy(p => LocalDate(p.PaidAt)).ToDictionary(g => g.Key, g => g.Sum(p => p.Amount));

        return Enumerable.Range(0, days).Select(i =>
        {
            var day = firstDay.AddDays(i);
            return new AdminTimeSeriesPointDto
            {
                Date = day,
                Signups = signupsByDay.GetValueOrDefault(day),
                EventsCreated = createdByDay.GetValueOrDefault(day),
                EventsPublished = publishedByDay.GetValueOrDefault(day),
                Guests = guestsByDay.GetValueOrDefault(day),
                Rsvps = rsvpsByDay.GetValueOrDefault(day),
                Visits = statsByDay.TryGetValue(day, out var s) ? s.Visits : 0,
                Shares = statsByDay.TryGetValue(day, out var s2) ? s2.Shares : 0,
                Revenue = revenueByDay.GetValueOrDefault(day),
            };
        }).ToList();
    }

    public async Task<AdminOrganizationDetailDto?> GetOrganizationAsync(Guid organizerId, CancellationToken cancellationToken)
    {
        var organizer = await _context.Organizers.IgnoreQueryFilters().AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == organizerId, cancellationToken);
        if (organizer == null) return null;

        var events = await _context.Events.IgnoreQueryFilters().AsNoTracking()
            .Where(e => e.OrganizerId == organizerId)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new AdminOrganizationEventDto
            {
                Id = e.Id,
                Name = e.Name,
                Slug = e.Slug,
                Status = e.Status.ToString(),
                EventDate = e.EventDate,
                Guests = _context.Guests.IgnoreQueryFilters().Count(g => g.EventId == e.Id),
                Confirmed = _context.Guests.IgnoreQueryFilters().Count(g => g.EventId == e.Id && g.Status == GuestStatus.Present),
                Visits = _context.EventStatsDailies.IgnoreQueryFilters().Where(s => s.EventId == e.Id).Sum(s => (int?)s.VisitsCount) ?? 0,
                Suspended = _context.EventModerations.Any(m => m.EventId == e.Id),
            })
            .ToListAsync(cancellationToken);

        var subscriptions = await _context.OrganizerSubscriptions.IgnoreQueryFilters().AsNoTracking()
            .Include(s => s.Plan)
            .Where(s => s.OrganizerId == organizerId)
            .OrderByDescending(s => s.StartedAt)
            .ToListAsync(cancellationToken);
        var now = DateTimeOffset.UtcNow;
        var current = subscriptions.FirstOrDefault(s =>
            (s.Status == SubscriptionStatus.Actif || s.Status == SubscriptionStatus.Essai) && (s.EndsAt == null || s.EndsAt > now));

        var payments = AdminDbContext.SasPayEnabled
            ? await _context.SubscriptionPayments.IgnoreQueryFilters().AsNoTracking()
                .Include(p => p.Plan)
                .Where(p => p.OrganizerId == organizerId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new AdminOrganizationPaymentDto
                {
                    PlanLabel = p.Plan != null ? p.Plan.Label : "",
                    Amount = p.Amount,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt,
                    PaidAt = p.PaidAt,
                })
                .ToListAsync(cancellationToken)
            : [];

        var plans = await _context.SubscriptionPlans.AsNoTracking()
            .Where(p => p.IsActive && p.Billing != PlanBilling.Gratuit)
            .OrderBy(p => p.PriceCents)
            .Select(p => new AdminPlanOptionDto { Id = p.Id, Code = p.Code, Label = p.Label })
            .ToListAsync(cancellationToken);

        return new AdminOrganizationDetailDto
        {
            Id = organizer.Id,
            Name = organizer.FullName,
            Email = organizer.Email,
            Phone = organizer.Phone,
            IsActive = organizer.IsActive,
            EmailVerified = await _context.OrganizerEmailVerifications.AnyAsync(v => v.OrganizerId == organizerId, cancellationToken),
            JoinedAt = organizer.CreatedAt,
            PlanCode = current?.Plan.Code ?? PlanService.FreePlanCode,
            PlanLabel = current?.Plan.Label ?? "Free",
            PlanEndsAt = current?.EndsAt,
            Events = events,
            Payments = payments,
            Subscriptions = subscriptions.Select(s => new AdminOrganizationSubscriptionDto
            {
                PlanLabel = s.Plan.Label,
                Status = s.Status.ToString(),
                StartedAt = s.StartedAt,
                EndsAt = s.EndsAt,
                Paid = s.PaymentId != null,
            }).ToList(),
            AvailablePlans = plans,
        };
    }

    // Offre attribuée à la main (mois offert, paiement reçu en espèces…) : l'abonnement en
    // cours s'arrête, la nouvelle offre démarre tout de suite pour le nombre de jours donné.
    public async Task GrantPlanAsync(Guid organizerId, AdminGrantPlanDto dto, CancellationToken cancellationToken)
    {
        if (!await _context.Organizers.IgnoreQueryFilters().AnyAsync(o => o.Id == organizerId, cancellationToken))
            throw new KeyNotFoundException("Organisation introuvable.");
        var plan = await _context.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Id == dto.PlanId && p.IsActive && p.Billing != PlanBilling.Gratuit, cancellationToken)
            ?? throw new InvalidOperationException("Offre inconnue ou inactive.");

        var now = DateTimeOffset.UtcNow;
        await EndActiveSubscriptionsAsync(organizerId, now, cancellationToken);
        _context.OrganizerSubscriptions.Add(new UserSubscription
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            PlanId = plan.Id,
            Status = SubscriptionStatus.Actif,
            StartedAt = now,
            EndsAt = now.AddDays(Math.Clamp(dto.Days, 1, 366)),
        });
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Retour à l'offre Free, tout de suite.
    public async Task RevokePlanAsync(Guid organizerId, CancellationToken cancellationToken)
    {
        if (!await _context.Organizers.IgnoreQueryFilters().AnyAsync(o => o.Id == organizerId, cancellationToken))
            throw new KeyNotFoundException("Organisation introuvable.");
        await EndActiveSubscriptionsAsync(organizerId, DateTimeOffset.UtcNow, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task EndActiveSubscriptionsAsync(Guid organizerId, DateTimeOffset now, CancellationToken cancellationToken)
    {
        var active = await _context.OrganizerSubscriptions.IgnoreQueryFilters()
            .Where(s => s.OrganizerId == organizerId && (s.Status == SubscriptionStatus.Actif || s.Status == SubscriptionStatus.Essai))
            .ToListAsync(cancellationToken);
        foreach (var s in active)
        {
            s.Status = SubscriptionStatus.Annule;
            s.EndsAt = now;
        }
    }
}
