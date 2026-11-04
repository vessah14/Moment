using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Prometheus;

namespace backend_EventMoment.Data
{
    // Requêtes SQL lentes : durée de chaque commande dans Prometheus (db_command_duration_seconds),
    // et au-delà du seuil, une ligne de journal (Loki) avec la route HTTP qui l'a lancée et le
    // texte SQL, sans les valeurs des paramètres (aucune donnée personnelle).
    public sealed class SlowQueryInterceptor : DbCommandInterceptor
    {
        public static readonly TimeSpan Threshold = TimeSpan.FromMilliseconds(250);

        private static readonly Histogram Duration = Metrics.CreateHistogram(
            "db_command_duration_seconds",
            "Durée des commandes SQL envoyées par EF Core",
            new HistogramConfiguration { LabelNames = ["kind"], Buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5] });

        private readonly IHttpContextAccessor _http;
        private readonly ILogger<SlowQueryInterceptor> _logger;

        public SlowQueryInterceptor(IHttpContextAccessor http, ILogger<SlowQueryInterceptor> logger)
        {
            _http = http;
            _logger = logger;
        }

        public override ValueTask<DbDataReader> ReaderExecutedAsync(DbCommand command, CommandExecutedEventData eventData, DbDataReader result, CancellationToken cancellationToken = default)
        {
            Record(command, eventData.Duration, "read");
            return base.ReaderExecutedAsync(command, eventData, result, cancellationToken);
        }

        public override DbDataReader ReaderExecuted(DbCommand command, CommandExecutedEventData eventData, DbDataReader result)
        {
            Record(command, eventData.Duration, "read");
            return base.ReaderExecuted(command, eventData, result);
        }

        public override ValueTask<int> NonQueryExecutedAsync(DbCommand command, CommandExecutedEventData eventData, int result, CancellationToken cancellationToken = default)
        {
            Record(command, eventData.Duration, "write");
            return base.NonQueryExecutedAsync(command, eventData, result, cancellationToken);
        }

        public override ValueTask<object?> ScalarExecutedAsync(DbCommand command, CommandExecutedEventData eventData, object? result, CancellationToken cancellationToken = default)
        {
            Record(command, eventData.Duration, "scalar");
            return base.ScalarExecutedAsync(command, eventData, result, cancellationToken);
        }

        private void Record(DbCommand command, TimeSpan duration, string kind)
        {
            Duration.WithLabels(kind).Observe(duration.TotalSeconds);
            if (duration < Threshold) return;
            var request = _http.HttpContext?.Request;
            var route = request == null ? "(tâche de fond)" : $"{request.Method} {request.Path}";
            var sql = command.CommandText.Length > 1500 ? command.CommandText[..1500] + "…" : command.CommandText;
            _logger.LogWarning("Requête SQL lente ({DurationMs} ms) pour {Route} : {Sql}", (int)duration.TotalMilliseconds, route, sql);
        }
    }
}
