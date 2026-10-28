using System.Text.RegularExpressions;

namespace backend_EventMoment.Services
{
    // Stockage des images téléversées (couvertures, photos de blocs, galerie). Le disque
    // local reste le défaut, Cloudinary est disponible et R2 prend priorité lorsqu'il est configuré.
    //
    // Les fichiers sont toujours nommés et rangés à partir d'identifiants (Guid), jamais
    // d'un nom ou d'une URL fournis par l'utilisateur.
    public interface IUploadStorage
    {
        // Enregistre une image déjà validée (taille, extension, signature) et renvoie son
        // URL publique : locale, Cloudinary ou domaine public configuré pour R2.
        Task<string> SaveImageAsync(IFormFile file, UploadFolder folder, Guid eventId, string extension);

        // Vrai si l'URL désigne une couverture téléversée sur la plateforme (et non une
        // image externe : pistage, injection CSS dans url(...)).
        bool IsUploadedCover(string url);

        // Supprime le fichier désigné par une URL produite par SaveImageAsync. Toute autre
        // URL est ignorée.
        Task DeleteFileAsync(string url);

        // Supprime les couvertures de l'événement autres que celle en cours d'utilisation
        // (anciennes couvertures remplacées, ou téléversées puis abandonnées).
        // urlsInUse : couverture actuelle + celles réutilisées par des événements dupliqués.
        Task DeleteUnusedCoversAsync(Guid eventId, IEnumerable<string?> urlsInUse);

        // Supprime tous les fichiers téléversés d'un événement (couvertures + galerie).
        Task DeleteEventFilesAsync(Guid eventId, bool keepCovers = false);
    }

    public enum UploadFolder
    {
        Covers,
        Blocks,
        Gallery
    }

    public static class UploadPaths
    {
        public static string Name(UploadFolder folder) => folder switch
        {
            UploadFolder.Covers => "covers",
            UploadFolder.Blocks => "blocks",
            UploadFolder.Gallery => "gallery",
            _ => throw new ArgumentOutOfRangeException(nameof(folder))
        };

        // Repère commun aux deux stockages : « …/covers/{eventId}/… ».
        public static string CoverMarker(Guid eventId) => $"/covers/{eventId}/";
    }

    // Stockage local sous wwwroot/uploads. Les chemins sont toujours reconstruits à partir
    // d'identifiants (Guid), jamais d'une URL fournie par l'utilisateur : CoverImageUrl est
    // une chaîne libre côté API, s'en servir comme chemin permettrait d'effacer n'importe
    // quel fichier du serveur ("../../appsettings.json").
    public class LocalUploadStorage : IUploadStorage
    {
        private static readonly Regex FileUrlPattern =
            new(@"^/uploads/(?<kind>covers|blocks|gallery)/(?<event>[0-9a-fA-F-]{36})/(?<file>[0-9a-fA-F-]{36}\.(jpg|jpeg|png|webp|gif))$");
        private static readonly Regex CoverUrlPattern =
            new(@"^/uploads/covers/(?<event>[0-9a-fA-F-]{36})/(?<file>[0-9a-fA-F-]{36}\.(jpg|jpeg|png|webp))$");

        private readonly IWebHostEnvironment _env;
        private readonly ILogger<LocalUploadStorage> _logger;

        public LocalUploadStorage(IWebHostEnvironment env, ILogger<LocalUploadStorage> logger)
        {
            _env = env;
            _logger = logger;
        }

        private string UploadsRoot => Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "uploads");

        private string EventDir(string kind, Guid eventId) => Path.Combine(UploadsRoot, kind, eventId.ToString());

        public async Task<string> SaveImageAsync(IFormFile file, UploadFolder folder, Guid eventId, string extension)
        {
            var kind = UploadPaths.Name(folder);
            var dir = EventDir(kind, eventId);
            Directory.CreateDirectory(dir);

            var fileName = $"{Guid.NewGuid()}{extension.ToLowerInvariant()}";
            var filePath = Path.Combine(dir, fileName);
            try
            {
                await using var stream = new FileStream(filePath, FileMode.CreateNew);
                await file.CopyToAsync(stream);
            }
            catch
            {
                TryDelete(() => File.Delete(filePath), filePath);
                throw;
            }

            return $"/uploads/{kind}/{eventId}/{fileName}";
        }

        public bool IsUploadedCover(string url) => CoverUrlPattern.IsMatch(url);

        public Task DeleteFileAsync(string url)
        {
            var match = FileUrlPattern.Match(url ?? string.Empty);
            if (match.Success)
            {
                var path = Path.Combine(EventDir(match.Groups["kind"].Value, Guid.Parse(match.Groups["event"].Value)), match.Groups["file"].Value);
                if (File.Exists(path))
                    TryDelete(() => File.Delete(path), path);
            }
            return Task.CompletedTask;
        }

        public Task DeleteUnusedCoversAsync(Guid eventId, IEnumerable<string?> urlsInUse)
        {
            var dir = EventDir("covers", eventId);
            if (!Directory.Exists(dir))
                return Task.CompletedTask;

            var keep = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var url in urlsInUse)
            {
                var match = url == null ? null : CoverUrlPattern.Match(url);
                if (match is { Success: true } && Guid.TryParse(match.Groups["event"].Value, out var coverEventId) && coverEventId == eventId)
                    keep.Add(match.Groups["file"].Value);
            }

            foreach (var file in Directory.EnumerateFiles(dir))
            {
                if (keep.Contains(Path.GetFileName(file)))
                    continue;
                TryDelete(() => File.Delete(file), file);
            }
            return Task.CompletedTask;
        }

        public Task DeleteEventFilesAsync(Guid eventId, bool keepCovers = false)
        {
            foreach (var kind in keepCovers ? new[] { "gallery" } : new[] { "covers", "gallery" })
            {
                var dir = EventDir(kind, eventId);
                if (Directory.Exists(dir))
                    TryDelete(() => Directory.Delete(dir, recursive: true), dir);
            }
            return Task.CompletedTask;
        }

        private void TryDelete(Action delete, string path)
        {
            try
            {
                delete();
            }
            catch (IOException ex)
            {
                // Fichier verrouillé ou déjà supprimé : ce n'est pas une raison de faire
                // échouer la requête de l'organisateur.
                _logger.LogWarning(ex, "Impossible de supprimer {Path}", path);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Impossible de supprimer {Path}", path);
            }
        }
    }
}
