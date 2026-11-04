using SkiaSharp;

namespace backend_EventMoment.Services
{
    // Photos envoyées par les organisateurs (couverture, galerie, images des blocs, photo de
    // profil) : remises à l'endroit, réduites à une taille d'écran et réencodées en WebP.
    // Une photo de téléphone de 4 à 10 Mo passe à quelques centaines de Ko, ce qui change
    // tout pour un invité en 3G. Le réencodage retire aussi toutes les métadonnées (GPS…).
    // GIF (animations) et images illisibles par SkiaSharp : seules les métadonnées sont
    // retirées, comme avant.
    public static class ImageOptimizer
    {
        public const int Quality = 80;

        public static int MaxSide(UploadFolder folder) => folder switch
        {
            UploadFolder.Avatars => 512,
            UploadFolder.Blocks => 1600,
            _ => 2000,
        };

        public static async Task<(IFormFile File, string Extension)> PrepareAsync(IFormFile file, string extension, int maxSide)
        {
            using var buffer = new MemoryStream();
            await file.CopyToAsync(buffer);
            var original = buffer.ToArray();
            var (data, ext) = Optimize(original, extension, maxSide);
            var name = Path.ChangeExtension(string.IsNullOrEmpty(file.FileName) ? "image" : Path.GetFileName(file.FileName), ext);
            return (new FormFile(new MemoryStream(data), 0, data.Length, file.Name, name)
            {
                Headers = new HeaderDictionary(),
                ContentType = ext switch { ".webp" => "image/webp", ".png" => "image/png", ".gif" => "image/gif", _ => "image/jpeg" },
            }, ext);
        }

        public static (byte[] Data, string Extension) Optimize(byte[] original, string extension, int maxSide)
        {
            var ext = extension.ToLowerInvariant();
            var stripped = ImageMetadataStripper.Strip(original, ext);
            if (ext == ".gif") return (stripped, ext);

            try
            {
                using var image = DecodeUpright(original, maxSide, out var resized);
                if (image == null) return (stripped, ext);
                using var encoded = image.Encode(SKEncodedImageFormat.Webp, Quality);
                if (encoded == null) return (stripped, ext);
                var webp = encoded.ToArray();
                // Petite image déjà légère (logo PNG optimisé…) : on garde l'original nettoyé.
                if (!resized && webp.Length >= stripped.Length) return (stripped, ext);
                return (webp, ".webp");
            }
            catch (Exception ex) when (ex is not OutOfMemoryException)
            {
                return (stripped, ext);
            }
        }

        private static SKImage? DecodeUpright(byte[] source, int maxSide, out bool resized)
        {
            resized = false;
            using var stream = new SKMemoryStream(source);
            using var codec = SKCodec.Create(stream);
            if (codec == null || codec.Info.Width <= 0 || codec.Info.Height <= 0)
                return null;

            var degrees = codec.EncodedOrigin switch
            {
                SKEncodedOrigin.BottomRight or SKEncodedOrigin.BottomLeft => 180,
                SKEncodedOrigin.RightTop or SKEncodedOrigin.LeftTop => 90,
                SKEncodedOrigin.LeftBottom or SKEncodedOrigin.RightBottom => 270,
                _ => 0,
            };

            var size = codec.GetScaledDimensions(Math.Min(1f, (float)maxSide / Math.Max(codec.Info.Width, codec.Info.Height)));
            var info = new SKImageInfo(size.Width, size.Height, SKColorType.Rgba8888, SKAlphaType.Premul);
            using var bitmap = new SKBitmap(info);
            var result = codec.GetPixels(info, bitmap.GetPixels());
            if (result is not (SKCodecResult.Success or SKCodecResult.IncompleteInput))
                return null;

            var scale = Math.Min(1f, (float)maxSide / Math.Max(bitmap.Width, bitmap.Height));
            var w = Math.Max(1, (int)Math.Round(bitmap.Width * scale));
            var h = Math.Max(1, (int)Math.Round(bitmap.Height * scale));
            resized = w < codec.Info.Width || h < codec.Info.Height;
            var sideways = degrees is 90 or 270;
            using var surface = SKSurface.Create(new SKImageInfo(sideways ? h : w, sideways ? w : h, SKColorType.Rgba8888, SKAlphaType.Premul));
            if (surface == null) return null;
            var canvas = surface.Canvas;
            canvas.Clear(SKColors.Transparent); // garde la transparence des logos PNG
            switch (degrees)
            {
                case 90: canvas.Translate(h, 0); break;
                case 180: canvas.Translate(w, h); break;
                case 270: canvas.Translate(0, w); break;
            }
            canvas.RotateDegrees(degrees);
            using var image = SKImage.FromBitmap(bitmap);
            canvas.DrawImage(image, SKRect.Create(0, 0, w, h), new SKSamplingOptions(SKCubicResampler.Mitchell));
            if (degrees != 0) resized = true; // réencodage nécessaire pour remettre à l'endroit
            return surface.Snapshot();
        }
    }
}
