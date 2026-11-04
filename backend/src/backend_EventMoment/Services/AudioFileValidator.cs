namespace backend_EventMoment.Services
{
    // Même contrôle que pour les images : le contenu d'un message vocal doit correspondre au
    // format annoncé par son extension (enregistrement du navigateur ou fichier du téléphone).
    public static class AudioFileValidator
    {
        public static async Task<bool> HasValidSignatureAsync(IFormFile file, string extension)
        {
            var header = new byte[12];
            await using var stream = file.OpenReadStream();
            var read = await stream.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false);
            if (read < header.Length)
                return false;

            return extension.ToLowerInvariant() switch
            {
                // Chrome, Android, Firefox : WebM (EBML) ou Ogg.
                ".webm" => header.AsSpan(0, 4).SequenceEqual(new byte[] { 0x1A, 0x45, 0xDF, 0xA3 }),
                ".ogg" => header.AsSpan(0, 4).SequenceEqual("OggS"u8),
                // iPhone, Safari : conteneur MP4 (boîte « ftyp »).
                ".m4a" => header.AsSpan(4, 4).SequenceEqual("ftyp"u8),
                ".mp3" => header.AsSpan(0, 3).SequenceEqual("ID3"u8) || (header[0] == 0xFF && (header[1] & 0xE0) == 0xE0),
                _ => false
            };
        }
    }
}
