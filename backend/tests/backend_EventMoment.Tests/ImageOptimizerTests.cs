using backend_EventMoment.Services;
using SkiaSharp;

namespace backend_EventMoment.Tests;

public class ImageOptimizerTests
{
    private static byte[] Photo(int w, int h, SKEncodedImageFormat format, int quality = 95, bool transparent = false)
    {
        using var surface = SKSurface.Create(new SKImageInfo(w, h, SKColorType.Rgba8888, SKAlphaType.Premul));
        var canvas = surface.Canvas;
        canvas.Clear(transparent ? SKColors.Transparent : SKColors.White);
        // Dégradé et bruit : une vraie photo se compresse mal, un aplat trop bien.
        using var paint = new SKPaint { Shader = SKShader.CreateLinearGradient(new SKPoint(0, 0), new SKPoint(w, h), new[] { SKColors.OrangeRed, SKColors.MediumPurple }, SKShaderTileMode.Clamp) };
        canvas.DrawRect(0, 0, w, transparent ? h / 2 : h, paint);
        var rnd = new Random(1);
        using var dot = new SKPaint();
        for (var i = 0; i < 4000; i++) { dot.Color = new SKColor((byte)rnd.Next(256), (byte)rnd.Next(256), (byte)rnd.Next(256)); canvas.DrawCircle(rnd.Next(w), rnd.Next(h / (transparent ? 2 : 1)), 3, dot); }
        using var image = surface.Snapshot();
        return image.Encode(format, quality).ToArray();
    }

    private static SKSizeI SizeOf(byte[] data)
    {
        using var codec = SKCodec.Create(new SKMemoryStream(data));
        return new SKSizeI(codec.Info.Width, codec.Info.Height);
    }

    [Fact]
    public void ShrinksAPhonePhotoToWebP()
    {
        var jpeg = Photo(4000, 3000, SKEncodedImageFormat.Jpeg);
        var (data, ext) = ImageOptimizer.Optimize(jpeg, ".jpg", 2000);

        Assert.Equal(".webp", ext);
        Assert.Equal(new SKSizeI(2000, 1500), SizeOf(data));
        Assert.True(data.Length < jpeg.Length / 3, $"{data.Length} vs {jpeg.Length}");
        Assert.True(ImageFileValidatorAccepts(data));
    }

    [Fact]
    public void KeepsTransparencyOfALogo()
    {
        var png = Photo(1200, 600, SKEncodedImageFormat.Png, transparent: true);
        var (data, ext) = ImageOptimizer.Optimize(png, ".png", 800);
        Assert.Equal(".webp", ext);
        using var bitmap = SKBitmap.Decode(data);
        Assert.Equal(800, bitmap.Width);
        Assert.Equal(0, bitmap.GetPixel(400, 390).Alpha);
    }

    [Fact]
    public void LeavesGifsAndUnreadableFilesUntouched()
    {
        var gif = new byte[] { 0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 1, 0, 1, 0, 0, 0, 0, 0x3B };
        Assert.Equal((gif, ".gif"), ImageOptimizer.Optimize(gif, ".gif", 2000));
        var broken = new byte[] { 0xFF, 0xD8, 0xFF, 0xD9 };
        Assert.Equal(".jpg", ImageOptimizer.Optimize(broken, ".jpg", 2000).Extension);
    }

    private static bool ImageFileValidatorAccepts(byte[] webp) =>
        webp.Length > 12 && webp[0] == 'R' && webp[1] == 'I' && webp[8] == 'W' && webp[9] == 'E';
}
