using backend_EventMoment.Data;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services;

public sealed class AdminTelemetryRetentionService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AdminTelemetryRetentionService> _logger;

    public AdminTelemetryRetentionService(
        IServiceScopeFactory scopeFactory,
        ILogger<AdminTelemetryRetentionService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var context = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
                var cutoff = DateTimeOffset.UtcNow.AddDays(-90);
                await context.AdminActivityLogs.Where(log => log.CreatedAt < cutoff)
                    .ExecuteDeleteAsync(stoppingToken);
                await context.TechnicalErrorLogs.Where(log => log.CreatedAt < cutoff)
                    .ExecuteDeleteAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                return;
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Le nettoyage des journaux admin de 90 jours a échoué.");
            }

            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}
