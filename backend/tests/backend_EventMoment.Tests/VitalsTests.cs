using backend_EventMoment.Controllers;

namespace backend_EventMoment.Tests;

public class VitalsTests
{
    [Fact]
    public void RecordsValidMeasures_AndRejectsUnknownPages()
    {
        Assert.True(VitalsController.RecordPayload("""{"page":"evenement","net":"3g","lcp":2400,"cls":0.05,"inp":180}"""));
        Assert.False(VitalsController.RecordPayload("""{"page":"/e/mariage-de-grace","lcp":2400}"""));
        Assert.False(VitalsController.RecordPayload("""{"page":"accueil","lcp":-1,"cls":"x"}"""));
        Assert.False(VitalsController.RecordPayload("pas du json"));
        Assert.True(VitalsController.RecordPayload("""{"page":"accueil","net":"5g-pirate","ttfb":300}"""));
    }
}

public class SlowQueryInterceptorTests
{
    private sealed class ListLogger : Microsoft.Extensions.Logging.ILogger<backend_EventMoment.Data.SlowQueryInterceptor>
    {
        public List<string> Lines { get; } = new();
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
        public bool IsEnabled(Microsoft.Extensions.Logging.LogLevel logLevel) => true;
        public void Log<TState>(Microsoft.Extensions.Logging.LogLevel logLevel, Microsoft.Extensions.Logging.EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter) =>
            Lines.Add(formatter(state, exception));
    }

    [Fact]
    public async Task LogsOnlySlowQueries_WithTheirRoute()
    {
        var logger = new ListLogger();
        var http = new Microsoft.AspNetCore.Http.HttpContextAccessor { HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext() };
        http.HttpContext.Request.Method = "GET";
        http.HttpContext.Request.Path = "/api/guests";
        var interceptor = new backend_EventMoment.Data.SlowQueryInterceptor(http, logger);
        var command = new Npgsql.NpgsqlCommand("SELECT * FROM guests WHERE event_id = @p0");

        await interceptor.NonQueryExecutedAsync(command, Event(TimeSpan.FromMilliseconds(20)), 0);
        Assert.Empty(logger.Lines);
        await interceptor.NonQueryExecutedAsync(command, Event(TimeSpan.FromMilliseconds(900)), 0);
        var line = Assert.Single(logger.Lines);
        Assert.Contains("900 ms", line);
        Assert.Contains("GET /api/guests", line);
    }

    private static Microsoft.EntityFrameworkCore.Diagnostics.CommandExecutedEventData Event(TimeSpan duration) =>
        new(null!, null!, null, null, null!, default, Guid.NewGuid(), Guid.NewGuid(), null, false, false, DateTimeOffset.UtcNow, duration,
            Microsoft.EntityFrameworkCore.Diagnostics.CommandSource.Unknown);
}
