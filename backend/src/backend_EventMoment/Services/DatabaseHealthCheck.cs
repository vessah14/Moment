using backend_EventMoment.Data;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace backend_EventMoment.Services;

public sealed class DatabaseHealthCheck : IHealthCheck
{
    private readonly AdminDbContext _context;

    public DatabaseHealthCheck(AdminDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        return await _context.Database.CanConnectAsync(cancellationToken)
            ? HealthCheckResult.Healthy()
            : HealthCheckResult.Unhealthy("Database is unreachable.");
    }
}
