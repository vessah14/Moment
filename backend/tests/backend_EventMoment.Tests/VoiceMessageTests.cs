using System.Text;
using backend_EventMoment.Services;
using Microsoft.AspNetCore.Http;

namespace backend_EventMoment.Tests;

public class VoiceMessageTests
{
    private static IFormFile File(byte[] content, string name) =>
        new FormFile(new MemoryStream(content), 0, content.Length, "file", name);

    private static byte[] Pad(byte[] head) => head.Concat(new byte[32]).ToArray();

    [Theory]
    [InlineData(".webm", new byte[] { 0x1A, 0x45, 0xDF, 0xA3 })]
    [InlineData(".ogg", new byte[] { 0x4F, 0x67, 0x67, 0x53 })]
    [InlineData(".m4a", new byte[] { 0, 0, 0, 0x20, 0x66, 0x74, 0x79, 0x70 })]
    [InlineData(".mp3", new byte[] { 0x49, 0x44, 0x33 })]
    public async Task AcceptsRealAudioFiles(string extension, byte[] head)
    {
        Assert.True(await AudioFileValidator.HasValidSignatureAsync(File(Pad(head), "m" + extension), extension));
    }

    [Fact]
    public async Task RejectsAPageRenamedAsAudio()
    {
        var html = Encoding.UTF8.GetBytes("<html><script>alert(1)</script></html>");
        Assert.False(await AudioFileValidator.HasValidSignatureAsync(File(html, "m.mp3"), ".mp3"));
        Assert.False(await AudioFileValidator.HasValidSignatureAsync(File(html, "m.webm"), ".webm"));
    }

    [Fact]
    public void ServesOnlyAVoiceUploadedForThisEvent()
    {
        var eventId = Guid.NewGuid();
        var storage = new LocalUploadStorage(null!, null!);
        var file = $"{Guid.NewGuid()}.m4a";

        Assert.True(storage.IsUploadedVoice($"/uploads/voices/{eventId}/{file}", eventId));
        Assert.False(storage.IsUploadedVoice($"/uploads/voices/{Guid.NewGuid()}/{file}", eventId));
        Assert.False(storage.IsUploadedVoice($"https://pistage.example/voices/{eventId}/{file}", eventId));
        Assert.False(storage.IsUploadedVoice($"/uploads/gallery/{eventId}/{Guid.NewGuid()}.jpg", eventId));
    }

    [Fact]
    public void ReadsTheVoiceFromTicketSettings()
    {
        var (url, from) = TicketSettings.ReadVoice("""{"ticket":{"style":"or","voice":{"url":"/uploads/voices/x.m4a","from":"  Shanice et sa famille "}}}""");
        Assert.Equal("/uploads/voices/x.m4a", url);
        Assert.Equal("Shanice et sa famille", from);
        Assert.Equal((null, null), TicketSettings.ReadVoice("""{"ticket":{"voice":"texte"}}"""));
        Assert.Equal((null, null), TicketSettings.ReadVoice("pas du json"));
    }
}
