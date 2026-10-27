using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces;

public interface IAdminTelemetryService
{
    Task<AdminDashboardDto> GetDashboardAsync(CancellationToken cancellationToken);
    Task<AdminSystemHealthDto> GetSystemHealthAsync(CancellationToken cancellationToken);
    Task<List<AdminActivityDto>> GetActivityAsync(int limit, CancellationToken cancellationToken);
    Task RecordActivityAsync(Guid? adminId, string adminEmail, string method, string route, CancellationToken cancellationToken);
    Task RecordTechnicalErrorAsync(string category, string route, int statusCode, CancellationToken cancellationToken);
}
