using System.Buffers.Binary;
using System.Text;

namespace backend_EventMoment.Services
{
    // Retire les métadonnées des images envoyées (galerie, couvertures) : une photo de
    // téléphone contient souvent la position GPS, la date, l'appareil… que n'importe quel
    // visiteur du site public pourrait lire. L'image elle-même n'est pas réencodée (aucune
    // perte de qualité) ; seule l'orientation JPEG est conservée, sinon les photos prises en
    // portrait s'afficheraient couchées.
    public static class ImageMetadataStripper
    {
        public static async Task<IFormFile> StripAsync(IFormFile file, string extension)
        {
            using var buffer = new MemoryStream();
            await file.CopyToAsync(buffer);
            var cleaned = Strip(buffer.ToArray(), extension);
            var stream = new MemoryStream(cleaned);
            return new FormFile(stream, 0, cleaned.Length, file.Name, file.FileName)
            {
                Headers = file.Headers,
                ContentType = file.ContentType,
            };
        }

        public static byte[] Strip(byte[] data, string extension)
        {
            try
            {
                return extension.ToLowerInvariant() switch
                {
                    ".jpg" or ".jpeg" => StripJpeg(data),
                    ".png" => StripPng(data),
                    ".webp" => StripWebp(data),
                    _ => data, // GIF : pas de métadonnées de localisation
                };
            }
            catch (Exception ex) when (ex is IndexOutOfRangeException or ArgumentException or InvalidDataException)
            {
                // Structure inattendue : l'image a déjà passé la vérification de signature,
                // on la garde telle quelle plutôt que de la refuser.
                return data;
            }
        }

        // --- JPEG -------------------------------------------------------------------
        private static readonly byte[] ExifId = Encoding.ASCII.GetBytes("Exif\0\0");
        private static readonly byte[] XmpId = Encoding.ASCII.GetBytes("http://ns.adobe.com/xap/1.0/\0");

        private static byte[] StripJpeg(byte[] data)
        {
            if (data.Length < 4 || data[0] != 0xFF || data[1] != 0xD8)
                throw new InvalidDataException();

            var segments = new List<(int Start, int Length)>();
            ushort? orientation = null;
            var pos = 2;
            while (pos < data.Length)
            {
                if (data[pos] != 0xFF) throw new InvalidDataException();
                while (pos < data.Length && data[pos] == 0xFF) pos++; // octets de remplissage
                var marker = data[pos];
                var markerStart = pos - 1;
                pos++;
                if (marker == 0xDA) // début des données de l'image : tout le reste est gardé
                {
                    segments.Add((markerStart, data.Length - markerStart));
                    break;
                }
                if (marker is 0xD8 or 0x01 or >= 0xD0 and <= 0xD7) { segments.Add((markerStart, pos - markerStart)); continue; }

                var length = BinaryPrimitives.ReadUInt16BigEndian(data.AsSpan(pos, 2));
                var payload = data.AsSpan(pos + 2, length - 2);
                var drop = marker switch
                {
                    0xE1 when payload.StartsWith(ExifId) => true,  // EXIF (GPS, appareil, date…)
                    0xE1 when payload.StartsWith(XmpId) => true,   // XMP
                    0xED => true,                                   // IPTC / Photoshop
                    0xFE => true,                                   // commentaire
                    _ => false,
                };
                if (marker == 0xE1 && payload.StartsWith(ExifId))
                    orientation ??= ReadExifOrientation(payload[ExifId.Length..]);
                if (!drop)
                    segments.Add((markerStart, pos + length - markerStart));
                pos += length;
            }

            using var output = new MemoryStream(data.Length);
            output.Write(data, 0, 2); // SOI
            if (orientation is >= 2 and <= 8)
                output.Write(MinimalExifOrientation(orientation.Value));
            foreach (var (start, len) in segments)
                output.Write(data, start, len);
            return output.ToArray();
        }

        private static ushort? ReadExifOrientation(ReadOnlySpan<byte> tiff)
        {
            if (tiff.Length < 8) return null;
            var little = tiff[0] == (byte)'I';
            ushort U16(ReadOnlySpan<byte> s) => little ? BinaryPrimitives.ReadUInt16LittleEndian(s) : BinaryPrimitives.ReadUInt16BigEndian(s);
            uint U32(ReadOnlySpan<byte> s) => little ? BinaryPrimitives.ReadUInt32LittleEndian(s) : BinaryPrimitives.ReadUInt32BigEndian(s);
            var ifd = (int)U32(tiff.Slice(4, 4));
            if (ifd + 2 > tiff.Length) return null;
            var count = U16(tiff.Slice(ifd, 2));
            for (var i = 0; i < count; i++)
            {
                var entry = ifd + 2 + i * 12;
                if (entry + 12 > tiff.Length) return null;
                if (U16(tiff.Slice(entry, 2)) == 0x0112)
                    return U16(tiff.Slice(entry + 8, 2));
            }
            return null;
        }

        // Segment EXIF minimal ne contenant que l'orientation (aucune autre donnée).
        private static byte[] MinimalExifOrientation(ushort orientation) =>
        [
            0xFF, 0xE1, 0x00, 0x22,
            (byte)'E', (byte)'x', (byte)'i', (byte)'f', 0x00, 0x00,
            (byte)'M', (byte)'M', 0x00, 0x2A, 0x00, 0x00, 0x00, 0x08,
            0x00, 0x01,
            0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, (byte)(orientation >> 8), (byte)orientation, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
        ];

        // --- PNG --------------------------------------------------------------------
        private static readonly HashSet<string> PngMetadataChunks = ["eXIf", "tEXt", "zTXt", "iTXt", "tIME"];

        private static byte[] StripPng(byte[] data)
        {
            using var output = new MemoryStream(data.Length);
            output.Write(data, 0, 8);
            var pos = 8;
            while (pos + 12 <= data.Length)
            {
                var length = (int)BinaryPrimitives.ReadUInt32BigEndian(data.AsSpan(pos, 4));
                var type = Encoding.ASCII.GetString(data, pos + 4, 4);
                var total = 12 + length;
                if (length < 0 || pos + total > data.Length) throw new InvalidDataException();
                if (!PngMetadataChunks.Contains(type))
                    output.Write(data, pos, total);
                pos += total;
                if (type == "IEND") break;
            }
            return output.ToArray();
        }

        // --- WebP -------------------------------------------------------------------
        private static byte[] StripWebp(byte[] data)
        {
            if (data.Length < 12 || Encoding.ASCII.GetString(data, 8, 4) != "WEBP")
                throw new InvalidDataException();
            using var body = new MemoryStream(data.Length);
            body.Write(data, 8, 4); // "WEBP"
            var pos = 12;
            while (pos + 8 <= data.Length)
            {
                var fourCc = Encoding.ASCII.GetString(data, pos, 4);
                var size = (int)BinaryPrimitives.ReadUInt32LittleEndian(data.AsSpan(pos + 4, 4));
                var total = 8 + size + (size & 1);
                if (size < 0 || pos + 8 + size > data.Length) throw new InvalidDataException();
                if (fourCc is not ("EXIF" or "XMP "))
                {
                    var chunk = data.AsSpan(pos, Math.Min(total, data.Length - pos)).ToArray();
                    if (fourCc == "VP8X" && chunk.Length > 8)
                        chunk[8] &= unchecked((byte)~(0x08 | 0x04)); // drapeaux EXIF et XMP
                    body.Write(chunk);
                }
                pos += total;
            }
            var payload = body.ToArray();
            var output = new byte[8 + payload.Length];
            Encoding.ASCII.GetBytes("RIFF").CopyTo(output, 0);
            BinaryPrimitives.WriteUInt32LittleEndian(output.AsSpan(4, 4), (uint)payload.Length);
            payload.CopyTo(output, 8);
            return output;
        }
    }
}
