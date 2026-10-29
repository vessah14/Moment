using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services;

public sealed class AdminTelemetryService : IAdminTelemetryService
{
    private readonly AdminDbContext _context;

    public AdminTelemetryService(AdminDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardDto> GetDashboardAsync(CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var today = DateOnly.FromDateTime(now.UtcDateTime);
        var weekAgo = now.AddDays(-7);
        var nextWeek = today.AddDays(7);
        var events = _context.Events.IgnoreQueryFilters().AsNoTracking();
        var organizers = _context.Organizers.IgnoreQueryFilters().AsNoTracking();
        var guests = _context.Guests.IgnoreQueryFilters().AsNoTracking();
        var rsvps = _context.RsvpResponses.IgnoreQueryFilters().AsNoTracking();

        var totalEvents = await events.CountAsync(cancellationToken);
        var publishedEvents = await events.CountAsync(e => e.Status == EventStatus.Publie, cancellationToken);
        var draftEvents = await events.CountAsync(e => e.Status == EventStatus.Brouillon, cancellationToken);
        var totalGuests = await guests.CountAsync(cancellationToken);

        var funnel = new List<AdminFunnelStepDto>
        {
            new() { Label = "Inscrits", Organizations = await organizers.CountAsync(cancellationToken) },
            new()
            {
                Label = "Événement créé",
                Organizations = await events.Select(e => e.OrganizerId).Distinct().CountAsync(cancellationToken)
            },
            new()
            {
                Label = "Événement publié",
                Organizations = await events.Where(e => e.Status == EventStatus.Publie)
                    .Select(e => e.OrganizerId).Distinct().CountAsync(cancellationToken)
            },
            new()
            {
                Label = "Invités ajoutés",
                Organizations = await guests.Join(events, g => g.EventId, e => e.Id, (_, e) => e.OrganizerId)
                    .Distinct().CountAsync(cancellationToken)
            },
            new()
            {
                Label = "Premier RSVP",
                Organizations = await rsvps.Where(r => r.RespondedAt != null)
                    .Join(events, r => r.EventId, e => e.Id, (_, e) => e.OrganizerId)
                    .Distinct().CountAsync(cancellationToken)
            }
        };

        var upcomingEvents = await events
            .Where(e => e.EventDate >= today && e.EventDate <= nextWeek)
            .OrderBy(e => e.EventDate)
            .Take(8)
            .Select(e => new AdminUpcomingEventDto
            {
                Id = e.Id,
                Name = e.Name,
                Organization = e.Utilisateur.FullName,
                EventDate = e.EventDate!.Value,
                Guests = guests.Count(g => g.EventId == e.Id)
            })
            .ToListAsync(cancellationToken);

        return new AdminDashboardDto
        {
            ActiveOrganizations = await organizers.CountAsync(o => o.IsActive, cancellationToken),
            TotalEvents = totalEvents,
            PublishedEvents = publishedEvents,
            DraftEvents = draftEvents,
            TotalGuests = totalGuests,
            ModerationAlerts = await _context.GuestBookEntries.IgnoreQueryFilters()
                .CountAsync(g => g.Status == GuestBookStatus.Signale, cancellationToken)
                + await _context.GalleryPhotos.IgnoreQueryFilters()
                    .CountAsync(p => p.Status == GalleryPhotoStatus.EnAttente, cancellationToken),
            ErrorsLast24Hours = await _context.TechnicalErrorLogs
                .CountAsync(e => e.CreatedAt >= now.AddHours(-24), cancellationToken),
            FailedPayments = AdminDbContext.SasPayEnabled
                ? await _context.SubscriptionPayments.IgnoreQueryFilters()
                    .CountAsync(payment => payment.Status == "FAILED", cancellationToken)
                : 0,
            PaymentsEnabled = AdminDbContext.SasPayEnabled,
            Funnel = funnel,
            Trends = new AdminDashboardTrendDto
            {
                Organizations = await organizers.CountAsync(o => o.CreatedAt >= weekAgo, cancellationToken),
                Events = await events.CountAsync(e => e.CreatedAt >= weekAgo, cancellationToken),
                PublishedEvents = await events.CountAsync(e => e.PublishedAt >= weekAgo, cancellationToken),
                Guests = await guests.CountAsync(g => g.CreatedAt >= weekAgo, cancellationToken),
                Rsvps = await rsvps.CountAsync(r => r.RespondedAt >= weekAgo, cancellationToken)
            },
            UpcomingEvents = upcomingEvents
        };
    }

    public async Task<AdminSystemHealthDto> GetSystemHealthAsync(CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var cutoff = now.AddHours(-24);
        var databaseAvailable = await _context.Database.CanConnectAsync(cancellationToken);
        if (!databaseAvailable)
            return new AdminSystemHealthDto { DatabaseAvailable = false, CheckedAt = now };

        var errorCount = await _context.TechnicalErrorLogs
            .CountAsync(e => e.CreatedAt >= cutoff, cancellationToken);
        var recentErrors = await _context.TechnicalErrorLogs.AsNoTracking()
            .Where(e => e.CreatedAt >= cutoff)
            .OrderByDescending(e => e.CreatedAt)
            .Take(100)
            .Select(e => new AdminTechnicalErrorDto
            {
                Category = e.Category,
                Route = e.Route,
                StatusCode = e.StatusCode,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new AdminSystemHealthDto
        {
            DatabaseAvailable = true,
            CheckedAt = now,
            ErrorsLast24Hours = errorCount,
            RecentErrors = recentErrors
        };
    }

    public async Task<List<AdminActivityDto>> GetActivityAsync(int limit, CancellationToken cancellationToken)
    {
        return await _context.AdminActivityLogs.AsNoTracking()
            .OrderByDescending(log => log.CreatedAt)
            .Take(Math.Clamp(limit, 1, 250))
            .Select(log => new AdminActivityDto
            {
                AdminEmail = log.AdminEmail,
                HttpMethod = log.HttpMethod,
                Route = log.Route,
                CreatedAt = log.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task RecordActivityAsync(Guid? adminId, string adminEmail, string method, string route, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        _context.AdminActivityLogs.Add(new AdminActivityLog
        {
            Id = Guid.NewGuid(),
            AdminId = adminId,
            AdminEmail = adminEmail,
            HttpMethod = method,
            Route = route,
            CreatedAt = now
        });
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RecordTechnicalErrorAsync(string category, string route, int statusCode, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        _context.TechnicalErrorLogs.Add(new TechnicalErrorLog
        {
            Id = Guid.NewGuid(),
            Category = category,
            Route = route,
            StatusCode = statusCode,
            CreatedAt = now
        });
        await _context.SaveChangesAsync(cancellationToken);
    }
}
