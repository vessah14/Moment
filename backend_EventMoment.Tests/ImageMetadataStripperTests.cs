using System.Buffers.Binary;
using System.Text;
using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

// Les photos envoyées ne doivent plus contenir de position GPS ni d'informations d'appareil.
public class ImageMetadataStripperTests
{
    private static byte[] Segment(byte marker, byte[] payload)
    {
        var s = new byte[4 + payload.Length];
        s[0] = 0xFF; s[1] = marker;
        BinaryPrimitives.WriteUInt16BigEndian(s.AsSpan(2), (ushort)(payload.Length + 2));
        payload.CopyTo(s, 4);
        return s;
    }

    // EXIF « II » contenant l'orientation (6 = portrait) et un faux bloc GPS repérable.
    private static byte[] ExifWithGps()
    {
        var tiff = new List<byte>();
        tiff.AddRange("II"u8.ToArray()); tiff.AddRange(new byte[] { 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00 });
        tiff.AddRange(new byte[] { 0x01, 0x00 });                                   // 1 entrée
        tiff.AddRange(new byte[] { 0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00 });
        tiff.AddRange(new byte[] { 0x00, 0x00, 0x00, 0x00 });
        tiff.AddRange(Encoding.ASCII.GetBytes("GPS:4.0511N,9.7679E-Douala"));
        return [.. Encoding.ASCII.GetBytes("Exif\0\0"), .. tiff];
    }

    [Fact]
    public void Jpeg_LosesGpsAndComments_ButKeepsOrientationAndImageData()
    {
        byte[] scan = [0xFF, 0xDA, 0x00, 0x02, 0x11, 0x22, 0x33, 0xFF, 0xD9];
        byte[] jpeg = [0xFF, 0xD8,
            .. Segment(0xE0, Encoding.ASCII.GetBytes("JFIF\0\x01\x01")),
            .. Segment(0xE1, ExifWithGps()),
            .. Segment(0xFE, Encoding.ASCII.GetBytes("pris chez Awa")),
            .. Segment(0xDB, [0x00, 0x01, 0x02]),
            .. scan];

        var cleaned = ImageMetadataStripper.Strip(jpeg, ".jpg");
        var text = Encoding.Latin1.GetString(cleaned);

        Assert.DoesNotContain("GPS:", text);
        Assert.DoesNotContain("pris chez Awa", text);
        Assert.Contains("JFIF", text);
        Assert.Equal(scan, cleaned[^scan.Length..]);
        // Orientation conservée dans un EXIF minimal : 0x0112, valeur 6.
        var idx = text.IndexOf("Exif", StringComparison.Ordinal);
        Assert.True(idx > 0);
        Assert.Equal(6, cleaned[idx + 6 + 8 + 2 + 8 + 1]);
    }

    [Fact]
    public void Png_LosesExifAndTextChunks()
    {
        static byte[] Chunk(string type, byte[] data)
        {
            var c = new byte[12 + data.Length];
            BinaryPrimitives.WriteUInt32BigEndian(c, (uint)data.Length);
            Encoding.ASCII.GetBytes(type).CopyTo(c, 4);
            data.CopyTo(c, 8);
            return c;
        }
        byte[] png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            .. Chunk("IHDR", new byte[13]),
            .. Chunk("eXIf", Encoding.ASCII.GetBytes("GPS:Douala")),
            .. Chunk("tEXt", Encoding.ASCII.GetBytes("Author\0Awa")),
            .. Chunk("IDAT", [1, 2, 3]),
            .. Chunk("IEND", [])];

        var text = Encoding.Latin1.GetString(ImageMetadataStripper.Strip(png, ".png"));

        Assert.DoesNotContain("GPS:", text);
        Assert.DoesNotContain("Author", text);
        Assert.Contains("IDAT", text);
        Assert.Contains("IEND", text);
    }

    [Fact]
    public void Webp_LosesExifAndXmp_AndFixesSizes()
    {
        static byte[] Chunk(string fourCc, byte[] data)
        {
            var c = new byte[8 + data.Length + (data.Length & 1)];
            Encoding.ASCII.GetBytes(fourCc).CopyTo(c, 0);
            BinaryPrimitives.WriteUInt32LittleEndian(c.AsSpan(4), (uint)data.Length);
            data.CopyTo(c, 8);
            return c;
        }
        byte[] body = [.. "WEBP"u8.ToArray(),
            .. Chunk("VP8X", [0x0C, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
            .. Chunk("VP8 ", [1, 2, 3, 4]),
            .. Chunk("EXIF", Encoding.ASCII.GetBytes("GPS:Douala")),
            .. Chunk("XMP ", Encoding.ASCII.GetBytes("<x>Awa</x>"))];
        byte[] webp = [.. "RIFF"u8.ToArray(), .. BitConverter.GetBytes((uint)body.Length), .. body];

        var cleaned = ImageMetadataStripper.Strip(webp, ".webp");
        var text = Encoding.Latin1.GetString(cleaned);

        Assert.DoesNotContain("GPS:", text);
        Assert.DoesNotContain("Awa", text);
        Assert.Equal((uint)(cleaned.Length - 8), BinaryPrimitives.ReadUInt32LittleEndian(cleaned.AsSpan(4)));
        Assert.Equal(0, cleaned[20] & 0x0C); // drapeaux EXIF/XMP du VP8X retirés
    }

    [Fact]
    public void UnexpectedStructure_IsKeptAsIs()
    {
        byte[] weird = [0xFF, 0xD8, 0x00, 0x01];
        Assert.Equal(weird, ImageMetadataStripper.Strip(weird, ".jpg"));
    }
}
