namespace backend_EventMoment.Services
{
    // Vérifie que le contenu d'un fichier téléversé correspond bien à une image du format
    // annoncé par son extension (signature binaire / "magic bytes"). L'extension seule ne
    // prouve rien : un fichier HTML renommé en .png passerait sinon le contrôle.
    public static class ImageFileValidator
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
                ".jpg" or ".jpeg" => header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF,
                ".png" => header.AsSpan(0, 8).SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }),
                ".gif" => header.AsSpan(0, 6).SequenceEqual("GIF87a"u8) || header.AsSpan(0, 6).SequenceEqual("GIF89a"u8),
                ".webp" => header.AsSpan(0, 4).SequenceEqual("RIFF"u8) && header.AsSpan(8, 4).SequenceEqual("WEBP"u8),
                _ => false
            };
        }
    }
}
