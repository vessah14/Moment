using System.Text.RegularExpressions;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace backend_EventMoment.Services
{
    // Paramètres Cloudinary (User Secrets / variables d'environnement, jamais dans
    // appsettings.json) :
    //   Cloudinary:CloudName, Cloudinary:ApiKey, Cloudinary:ApiSecret
    //   Cloudinary:Folder  dossier racine des images (par défaut « tbf-moment »)
    public sealed class CloudinaryOptions
    {
        public string CloudName { get; init; } = string.Empty;
        public string ApiKey { get; init; } = string.Empty;
        public string ApiSecret { get; init; } = string.Empty;
        public string Folder { get; init; } = "tbf-moment";

        public static CloudinaryOptions? FromConfiguration(IConfiguration config)
        {
            var section = config.GetSection("Cloudinary");
            var options = new CloudinaryOptions
            {
                CloudName = section["CloudName"]?.Trim() ?? string.Empty,
                ApiKey = section["ApiKey"]?.Trim() ?? string.Empty,
                ApiSecret = section["ApiSecret"]?.Trim() ?? string.Empty,
                Folder = string.IsNullOrWhiteSpace(section["Folder"]) ? "tbf-moment" : section["Folder"]!.Trim().Trim('/'),
            };
            if (options.CloudName.Length == 0 && options.ApiKey.Length == 0 && options.ApiSecret.Length == 0)
                return null;
            if (options.CloudName.Length == 0 || options.ApiKey.Length == 0 || options.ApiSecret.Length == 0)
                throw new InvalidOperationException("Cloudinary est partiellement configuré : CloudName, ApiKey et ApiSecret sont tous obligatoires.");
            // Ces deux valeurs finissent dans des URL et des expressions régulières.
            if (!Regex.IsMatch(options.CloudName, "^[A-Za-z0-9_-]+$"))
                throw new InvalidOperationException("Cloudinary:CloudName invalide.");
            if (!Regex.IsMatch(options.Folder, "^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*$"))
                throw new InvalidOperationException("Cloudinary:Folder invalide (lettres, chiffres, - et _ séparés par /).");
            return options;
        }
    }

    // Images rangées sous {Folder}/{covers|blocks|gallery}/{eventId}/{Guid}. Les fichiers
    // téléversés avant le passage à Cloudinary (/uploads/…) restent servis et sont
    // toujours nettoyés par le stockage local.
    public sealed class CloudinaryUploadStorage : IUploadStorage
    {
        private readonly Cloudinary _cloudinary;
        private readonly CloudinaryOptions _options;
        private readonly LocalUploadStorage _legacy;
        private readonly ILogger<CloudinaryUploadStorage> _logger;
        private readonly Regex _fileUrlPattern;
        private readonly Regex _coverUrlPattern;

        public CloudinaryUploadStorage(CloudinaryOptions options, LocalUploadStorage legacy, ILogger<CloudinaryUploadStorage> logger)
        {
            _options = options;
            _legacy = legacy;
            _logger = logger;
            _cloudinary = new Cloudinary(new Account(options.CloudName, options.ApiKey, options.ApiSecret));
            _cloudinary.Api.Secure = true;

            // https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{kind}/{event}/{file}.{ext}
            var prefix = $@"^https://res\.cloudinary\.com/{Regex.Escape(options.CloudName)}/image/upload/v\d+/{Regex.Escape(options.Folder)}/";
            const string guid = "[0-9a-fA-F-]{36}";
            _fileUrlPattern = new Regex(prefix + $@"(?<kind>covers|blocks|gallery)/(?<event>{guid})/(?<file>{guid})\.(jpg|jpeg|png|webp|gif)$");
            _coverUrlPattern = new Regex(prefix + $@"covers/{guid}/{guid}\.(jpg|jpeg|png|webp)$");
        }

        private string PublicId(string kind, Guid eventId, string file) => $"{_options.Folder}/{kind}/{eventId}/{file}";

        private string EventPrefix(string kind, Guid eventId) => $"{_options.Folder}/{kind}/{eventId}/";

        public async Task<string> SaveImageAsync(IFormFile file, UploadFolder folder, Guid eventId, string extension)
        {
            var kind = UploadPaths.Name(folder);
            await using var stream = file.OpenReadStream();
            var upload = new ImageUploadParams
            {
                File = new FileDescription($"{Guid.NewGuid()}{extension.ToLowerInvariant()}", stream),
                PublicId = PublicId(kind, eventId, Guid.NewGuid().ToString()),
                Overwrite = false,
                UniqueFilename = false,
                UseFilename = false,
                // Défense en profondeur : Cloudinary refuse tout autre format.
                AllowedFormats = new[] { "jpg", "jpeg", "png", "webp", "gif" },
            };

            var result = await _cloudinary.UploadAsync(upload);
            if (result.Error != null || result.SecureUrl == null)
            {
                _logger.LogError("Envoi Cloudinary refusé ({Status}) : {Message}", result.StatusCode, result.Error?.Message);
                throw new InvalidOperationException("L'envoi de l'image a échoué. Réessayez dans un instant.");
            }

            var url = result.SecureUrl.ToString();
            if (!_fileUrlPattern.IsMatch(url))
            {
                // Ne devrait jamais arriver : on ne renvoie pas une URL que le site refuserait.
                _logger.LogError("URL Cloudinary inattendue : {Url}", url);
                await DestroyAsync(result.PublicId);
                throw new InvalidOperationException("L'envoi de l'image a échoué. Réessayez dans un instant.");
            }
            return url;
        }

        public bool IsUploadedCover(string url) => _coverUrlPattern.IsMatch(url) || _legacy.IsUploadedCover(url);

        public async Task DeleteFileAsync(string url)
        {
            var match = _fileUrlPattern.Match(url ?? string.Empty);
            if (!match.Success)
            {
                await _legacy.DeleteFileAsync(url ?? string.Empty);
                return;
            }
            await DestroyAsync(PublicId(match.Groups["kind"].Value, Guid.Parse(match.Groups["event"].Value), match.Groups["file"].Value));
        }

        public async Task DeleteUnusedCoversAsync(Guid eventId, IEnumerable<string?> urlsInUse)
        {
            var urls = urlsInUse.ToList();
            await _legacy.DeleteUnusedCoversAsync(eventId, urls);

            var keep = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var url in urls)
            {
                var match = url == null ? null : _fileUrlPattern.Match(url);
                if (match is { Success: true } && match.Groups["kind"].Value == "covers" && match.Groups["event"].Value.Equals(eventId.ToString(), StringComparison.OrdinalIgnoreCase))
                    keep.Add(PublicId("covers", eventId, match.Groups["file"].Value));
            }

            try
            {
                var prefix = EventPrefix("covers", eventId);
                string? cursor = null;
                var unused = new List<string>();
                do
                {
                    var page = await _cloudinary.ListResourcesByPrefixAsync(prefix, "upload", cursor);
                    if (page.Error != null)
                    {
                        _logger.LogWarning("Liste Cloudinary impossible pour {Prefix} : {Message}", prefix, page.Error.Message);
                        return;
                    }
                    unused.AddRange(page.Resources.Select(r => r.PublicId).Where(id => !keep.Contains(id)));
                    cursor = page.NextCursor;
                } while (!string.IsNullOrEmpty(cursor));

                foreach (var publicId in unused)
                    await DestroyAsync(publicId);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // Le ménage ne doit jamais faire échouer l'enregistrement de l'organisateur.
                _logger.LogWarning(ex, "Nettoyage des couvertures Cloudinary impossible pour {EventId}", eventId);
            }
        }

        public async Task DeleteEventFilesAsync(Guid eventId, bool keepCovers = false)
        {
            await _legacy.DeleteEventFilesAsync(eventId, keepCovers);

            foreach (var kind in keepCovers ? new[] { "gallery" } : new[] { "covers", "gallery" })
            {
                try
                {
                    var result = await _cloudinary.DeleteResourcesByPrefixAsync(EventPrefix(kind, eventId));
                    if (result.Error != null)
                        _logger.LogWarning("Suppression Cloudinary impossible ({Kind}, {EventId}) : {Message}", kind, eventId, result.Error.Message);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    _logger.LogWarning(ex, "Suppression Cloudinary impossible ({Kind}, {EventId})", kind, eventId);
                }
            }
        }

        private async Task DestroyAsync(string publicId)
        {
            try
            {
                var result = await _cloudinary.DestroyAsync(new DeletionParams(publicId) { ResourceType = ResourceType.Image, Invalidate = true });
                if (result.Error != null)
                    _logger.LogWarning("Suppression Cloudinary impossible pour {PublicId} : {Message}", publicId, result.Error.Message);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogWarning(ex, "Suppression Cloudinary impossible pour {PublicId}", publicId);
            }
        }
    }
}
