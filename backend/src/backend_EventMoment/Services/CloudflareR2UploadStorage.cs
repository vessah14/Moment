using System.Text.RegularExpressions;
using Amazon.S3;
using Amazon.S3.Model;

namespace backend_EventMoment.Services
{
    // R2 credentials belong in environment variables / a secret manager, never in source control:
    // CloudflareR2:AccountId, AccessKeyId, SecretAccessKey, Bucket, PublicBaseUrl, Folder.
    public sealed class CloudflareR2Options
    {
        public string AccountId { get; init; } = string.Empty;
        public string AccessKeyId { get; init; } = string.Empty;
        public string SecretAccessKey { get; init; } = string.Empty;
        public string Bucket { get; init; } = string.Empty;
        public string PublicBaseUrl { get; init; } = string.Empty;
        public string Folder { get; init; } = "tbf-moment";

        public static CloudflareR2Options? FromConfiguration(IConfiguration config)
        {
            var section = config.GetSection("CloudflareR2");
            var options = new CloudflareR2Options
            {
                AccountId = section["AccountId"]?.Trim() ?? string.Empty,
                AccessKeyId = section["AccessKeyId"]?.Trim() ?? string.Empty,
                SecretAccessKey = section["SecretAccessKey"]?.Trim() ?? string.Empty,
                Bucket = section["Bucket"]?.Trim() ?? string.Empty,
                PublicBaseUrl = section["PublicBaseUrl"]?.Trim().TrimEnd('/') ?? string.Empty,
                Folder = string.IsNullOrWhiteSpace(section["Folder"]) ? "tbf-moment" : section["Folder"]!.Trim().Trim('/'),
            };

            if (new[] { options.AccountId, options.AccessKeyId, options.SecretAccessKey, options.Bucket, options.PublicBaseUrl }.All(string.IsNullOrEmpty))
                return null;

            if (new[] { options.AccountId, options.AccessKeyId, options.SecretAccessKey, options.Bucket, options.PublicBaseUrl }.Any(string.IsNullOrEmpty))
                throw new InvalidOperationException("Cloudflare R2 est partiellement configuré : AccountId, AccessKeyId, SecretAccessKey, Bucket et PublicBaseUrl sont obligatoires.");

            if (!Regex.IsMatch(options.AccountId, "^[A-Za-z0-9_-]+$"))
                throw new InvalidOperationException("CloudflareR2:AccountId invalide.");
            if (!Regex.IsMatch(options.Bucket, "^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$"))
                throw new InvalidOperationException("CloudflareR2:Bucket invalide.");
            if (!Regex.IsMatch(options.Folder, "^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*$"))
                throw new InvalidOperationException("CloudflareR2:Folder invalide (lettres, chiffres, - et _ séparés par /).");
            if (!Uri.TryCreate(options.PublicBaseUrl, UriKind.Absolute, out var publicUri)
                || publicUri.Scheme != Uri.UriSchemeHttps
                || !string.IsNullOrEmpty(publicUri.UserInfo)
                || publicUri.AbsolutePath != "/"
                || !string.IsNullOrEmpty(publicUri.Query)
                || !string.IsNullOrEmpty(publicUri.Fragment))
                throw new InvalidOperationException("CloudflareR2:PublicBaseUrl doit être un domaine HTTPS public, sans chemin, paramètre ni fragment.");

            return options;
        }
    }

    // New uploads go to R2. Previously stored local and Cloudinary URLs remain supported.
    public sealed class CloudflareR2UploadStorage : IUploadStorage, IDisposable
    {
        private static readonly Regex FilePathPattern = new(
            @"^/(?<folder>[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)*)/(?<kind>covers|blocks|gallery)/(?<event>[0-9a-fA-F-]{36})/(?<file>[0-9a-fA-F-]{36}\.(jpg|jpeg|png|webp|gif))$");
        private static readonly Regex CoverPathPattern = new(
            @"^/(?<folder>[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)*)/covers/(?<event>[0-9a-fA-F-]{36})/(?<file>[0-9a-fA-F-]{36}\.(jpg|jpeg|png|webp))$");

        private readonly IAmazonS3 _s3;
        private readonly CloudflareR2Options _options;
        private readonly LocalUploadStorage _legacy;
        private readonly Uri _publicBaseUri;
        private readonly ILogger<CloudflareR2UploadStorage> _logger;

        public CloudflareR2UploadStorage(
            CloudflareR2Options options,
            LocalUploadStorage legacy,
            ILogger<CloudflareR2UploadStorage> logger)
            : this(options, legacy, logger, CreateClient(options))
        {
        }

        internal CloudflareR2UploadStorage(
            CloudflareR2Options options,
            LocalUploadStorage legacy,
            ILogger<CloudflareR2UploadStorage> logger,
            IAmazonS3 s3)
        {
            _options = options;
            _legacy = legacy;
            _logger = logger;
            _s3 = s3;
            _publicBaseUri = new Uri(options.PublicBaseUrl, UriKind.Absolute);
        }

        private static IAmazonS3 CreateClient(CloudflareR2Options options) =>
            new AmazonS3Client(
                options.AccessKeyId,
                options.SecretAccessKey,
                new AmazonS3Config
                {
                    ServiceURL = $"https://{options.AccountId}.r2.cloudflarestorage.com",
                    AuthenticationRegion = "auto",
                    ForcePathStyle = true,
                });

        private string ObjectKey(string kind, Guid eventId, string file) =>
            $"{_options.Folder}/{kind}/{eventId}/{file}";

        private string EventPrefix(string kind, Guid eventId) =>
            $"{_options.Folder}/{kind}/{eventId}/";

        private bool TryGetObjectKey(string? url, out string key, out Match match)
        {
            key = string.Empty;
            match = Match.Empty;
            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)
                || uri.Scheme != Uri.UriSchemeHttps
                || !uri.Authority.Equals(_publicBaseUri.Authority, StringComparison.OrdinalIgnoreCase)
                || !string.IsNullOrEmpty(uri.Query)
                || !string.IsNullOrEmpty(uri.Fragment))
                return false;

            match = FilePathPattern.Match(uri.AbsolutePath);
            if (!match.Success || !match.Groups["folder"].Value.Equals(_options.Folder, StringComparison.Ordinal))
                return false;

            key = uri.AbsolutePath[1..];
            return true;
        }

        public async Task<string> SaveImageAsync(IFormFile file, UploadFolder folder, Guid eventId, string extension)
        {
            var kind = UploadPaths.Name(folder);
            var fileName = $"{Guid.NewGuid()}{extension.ToLowerInvariant()}";
            var key = ObjectKey(kind, eventId, fileName);
            await using var stream = file.OpenReadStream();

            try
            {
                await _s3.PutObjectAsync(new PutObjectRequest
                {
                    BucketName = _options.Bucket,
                    Key = key,
                    InputStream = stream,
                    // R2 ne prend pas en charge la signature SigV4 en streaming ni les checksums par défaut du SDK.
                    DisablePayloadSigning = true,
                    DisableDefaultChecksumValidation = true,
                    ContentType = extension.ToLowerInvariant() switch
                    {
                        ".jpg" or ".jpeg" => "image/jpeg",
                        ".png" => "image/png",
                        ".webp" => "image/webp",
                        ".gif" => "image/gif",
                        _ => throw new InvalidOperationException("Extension d’image non prise en charge."),
                    },
                });
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Envoi d'image vers Cloudflare R2 échoué pour {EventId}", eventId);
                throw new InvalidOperationException("L'envoi de l'image a échoué. Réessayez dans un instant.", ex);
            }

            return $"{_options.PublicBaseUrl}/{key}";
        }

        public bool IsUploadedCover(string url)
        {
            if (TryGetObjectKey(url, out _, out var match)
                && CoverPathPattern.IsMatch(new Uri(url).AbsolutePath)
                && match.Groups["kind"].Value == "covers")
                return true;
            return _legacy.IsUploadedCover(url);
        }

        public void Dispose() => _s3.Dispose();

        public async Task DeleteFileAsync(string url)
        {
            if (!TryGetObjectKey(url, out var key, out _))
            {
                await _legacy.DeleteFileAsync(url ?? string.Empty);
                return;
            }

            try
            {
                await _s3.DeleteObjectAsync(_options.Bucket, key);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogWarning(ex, "Suppression R2 impossible pour {Key}", key);
            }
        }

        public async Task DeleteUnusedCoversAsync(Guid eventId, IEnumerable<string?> urlsInUse)
        {
            var urls = urlsInUse.ToList();
            await _legacy.DeleteUnusedCoversAsync(eventId, urls);

            var keep = new HashSet<string>(StringComparer.Ordinal);
            foreach (var url in urls)
            {
                if (TryGetObjectKey(url, out var key, out var match)
                    && match.Groups["kind"].Value == "covers"
                    && Guid.TryParse(match.Groups["event"].Value, out var coverEventId)
                    && coverEventId == eventId)
                    keep.Add(key);
            }

            await DeleteUnusedPrefixAsync(EventPrefix("covers", eventId), keep, eventId, "covers");
        }

        public async Task DeleteEventFilesAsync(Guid eventId, bool keepCovers = false)
        {
            await _legacy.DeleteEventFilesAsync(eventId, keepCovers);

            foreach (var kind in keepCovers ? new[] { "gallery" } : new[] { "covers", "gallery" })
                await DeletePrefixAsync(EventPrefix(kind, eventId), eventId, kind);
        }

        private async Task DeleteUnusedPrefixAsync(string prefix, HashSet<string> keep, Guid eventId, string kind)
        {
            try
            {
                await foreach (var key in ListKeysAsync(prefix))
                {
                    if (!keep.Contains(key))
                        await _s3.DeleteObjectAsync(_options.Bucket, key);
                }
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogWarning(ex, "Nettoyage des couvertures R2 impossible pour {EventId}", eventId);
            }
        }

        private async Task DeletePrefixAsync(string prefix, Guid eventId, string kind)
        {
            try
            {
                await foreach (var key in ListKeysAsync(prefix))
                    await _s3.DeleteObjectAsync(_options.Bucket, key);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogWarning(ex, "Suppression R2 impossible ({Kind}, {EventId})", kind, eventId);
            }
        }

        private async IAsyncEnumerable<string> ListKeysAsync(string prefix)
        {
            string? continuationToken = null;
            do
            {
                var response = await _s3.ListObjectsV2Async(new ListObjectsV2Request
                {
                    BucketName = _options.Bucket,
                    Prefix = prefix,
                    ContinuationToken = continuationToken,
                });

                foreach (var item in response.S3Objects)
                    yield return item.Key;

                continuationToken = response.IsTruncated == true ? response.NextContinuationToken : null;
            } while (continuationToken != null);
        }
    }
}
