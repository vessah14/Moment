using backend_EventMoment.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Abstractions;

namespace backend_EventMoment.Tests;

public class UploadStorageTests : IDisposable
{
    private readonly string _root = Path.Combine(Path.GetTempPath(), "tbf-upload-tests-" + Guid.NewGuid());

    private sealed class FakeEnv : IWebHostEnvironment
    {
        public string WebRootPath { get; set; } = string.Empty;
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string ApplicationName { get; set; } = "tests";
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = string.Empty;
        public string EnvironmentName { get; set; } = "Test";
    }

    private LocalUploadStorage CreateStorage() =>
        new(new FakeEnv { WebRootPath = Path.Combine(_root, "wwwroot"), ContentRootPath = _root }, NullLogger<LocalUploadStorage>.Instance);

    private string Touch(params string[] parts)
    {
        var path = Path.Combine(new[] { _root }.Concat(parts).ToArray());
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, "x");
        return path;
    }

    [Fact]
    public async Task DeleteUnusedCovers_KeepsCurrentCover_AndRemovesOldOnes()
    {
        var eventId = Guid.NewGuid();
        var current = $"{Guid.NewGuid()}.png";
        var keep = Touch("wwwroot", "uploads", "covers", eventId.ToString(), current);
        var old = Touch("wwwroot", "uploads", "covers", eventId.ToString(), $"{Guid.NewGuid()}.jpg");

        await CreateStorage().DeleteUnusedCoversAsync(eventId, new[] { $"/uploads/covers/{eventId}/{current}" });

        Assert.True(File.Exists(keep));
        Assert.False(File.Exists(old));
    }

    [Fact]
    public async Task DeleteUnusedCovers_IgnoresPathTraversalInUrl()
    {
        var eventId = Guid.NewGuid();
        var secret = Touch("appsettings.json");
        Touch("wwwroot", "uploads", "covers", eventId.ToString(), $"{Guid.NewGuid()}.png");

        await CreateStorage().DeleteUnusedCoversAsync(eventId, new[] { "/uploads/covers/../../../appsettings.json" });

        Assert.True(File.Exists(secret));
    }

    [Fact]
    public async Task DeleteEventFiles_RemovesOnlyThatEventsFolders()
    {
        var eventId = Guid.NewGuid();
        var otherId = Guid.NewGuid();
        var cover = Touch("wwwroot", "uploads", "covers", eventId.ToString(), "a.png");
        var photo = Touch("wwwroot", "uploads", "gallery", eventId.ToString(), "b.png");
        var otherPhoto = Touch("wwwroot", "uploads", "gallery", otherId.ToString(), "c.png");

        await CreateStorage().DeleteEventFilesAsync(eventId);

        Assert.False(File.Exists(cover));
        Assert.False(File.Exists(photo));
        Assert.True(File.Exists(otherPhoto));
    }

    [Fact]
    public void CloudinaryOptions_UsesLocalStorageWhenNotConfigured()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        Assert.Null(CloudinaryOptions.FromConfiguration(config));
    }

    [Fact]
    public void CloudinaryOptions_RequiresAllCredentialsWhenPartiallyConfigured()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Cloudinary:CloudName"] = "demo",
            })
            .Build();

        Assert.Throws<InvalidOperationException>(() => CloudinaryOptions.FromConfiguration(config));
    }

    [Fact]
    public void CloudinaryUploadStorage_AcceptsItsUrlsAndLegacyLocalCovers()
    {
        var eventId = Guid.NewGuid();
        var fileId = Guid.NewGuid();
        var local = CreateStorage();
        var storage = new CloudinaryUploadStorage(
            new CloudinaryOptions { CloudName = "demo", ApiKey = "test-key", ApiSecret = "test-secret" },
            local,
            NullLogger<CloudinaryUploadStorage>.Instance);

        Assert.True(storage.IsUploadedCover($"https://res.cloudinary.com/demo/image/upload/v123/tbf-moment/covers/{eventId}/{fileId}.jpg"));
        Assert.True(storage.IsUploadedCover($"/uploads/covers/{eventId}/{fileId}.jpg"));
        Assert.False(storage.IsUploadedCover($"https://res.cloudinary.com/other/image/upload/v123/tbf-moment/covers/{eventId}/{fileId}.jpg"));
    }

    [Fact]
    public void CloudflareR2Options_UsesLocalStorageWhenNotConfigured()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        Assert.Null(CloudflareR2Options.FromConfiguration(config));
    }

    [Fact]
    public void CloudflareR2Options_RequiresAllSettingsWhenPartiallyConfigured()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["CloudflareR2:AccountId"] = "account",
            })
            .Build();

        Assert.Throws<InvalidOperationException>(() => CloudflareR2Options.FromConfiguration(config));
    }

    [Fact]
    public void CloudflareR2UploadStorage_AcceptsOnlyItsOwnCoversAndLegacyLocalCovers()
    {
        var eventId = Guid.NewGuid();
        var fileId = Guid.NewGuid();
        var local = CreateStorage();
        var options = new CloudflareR2Options
        {
            AccountId = "account",
            AccessKeyId = "test-key",
            SecretAccessKey = "test-secret",
            Bucket = "tbf-moment-media",
            PublicBaseUrl = "https://media.example.com",
        };
        using var storage = new CloudflareR2UploadStorage(
            options,
            local,
            NullLogger<CloudflareR2UploadStorage>.Instance);

        Assert.True(storage.IsUploadedCover($"https://media.example.com/tbf-moment/covers/{eventId}/{fileId}.jpg"));
        Assert.True(storage.IsUploadedCover($"/uploads/covers/{eventId}/{fileId}.jpg"));
        Assert.False(storage.IsUploadedCover($"https://attacker.example/tbf-moment/covers/{eventId}/{fileId}.jpg"));
        Assert.False(storage.IsUploadedCover($"https://media.example.com/tbf-moment/gallery/{eventId}/{fileId}.jpg"));
    }

    public void Dispose()
    {
        if (Directory.Exists(_root))
            Directory.Delete(_root, recursive: true);
    }
}
