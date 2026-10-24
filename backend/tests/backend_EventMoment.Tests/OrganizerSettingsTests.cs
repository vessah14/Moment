using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

// Organisateur rangé dans events.custom_fields : nom tronqué, logo limité à nos images ou https.
public class OrganizerSettingsTests
{
    [Fact]
    public void ReadsNameAndUploadedLogo()
    {
        var result = OrganizerSettings.Read("""{"organizer":{"name":"  IUGET de Bonabéri ","logoUrl":"/uploads/blocks/a/logo.png"}}""");
        Assert.Equal(("IUGET de Bonabéri", "/uploads/blocks/a/logo.png"), result);
    }

    [Theory]
    [InlineData("javascript:alert(1)")]
    [InlineData("//evil.example/logo.png")]
    [InlineData("http://example.com/logo.png")]
    [InlineData("data:image/svg+xml;base64,PHN2Zz4=")]
    public void RejectsUnsafeLogoUrls(string logoUrl)
    {
        var (name, logo) = OrganizerSettings.Read("{\"organizer\":{\"name\":\"Wouri\",\"logoUrl\":\"" + logoUrl + "\"}}");
        Assert.Equal("Wouri", name);
        Assert.Null(logo);
    }

    [Theory]
    [InlineData("""{"organizer":"Wouri"}""")]
    [InlineData("pas du json")]
    [InlineData("")]
    public void IgnoresMalformedValues(string customFields)
    {
        Assert.Equal((null, null), OrganizerSettings.Read(customFields));
    }

    [Fact]
    public void TruncatesLongName()
    {
        var (name, _) = OrganizerSettings.Read("{\"organizer\":{\"name\":\"" + new string('a', 120) + "\"}}");
        Assert.Equal(OrganizerSettings.MaxNameLength, name!.Length);
    }
}
