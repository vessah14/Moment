using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

// Modèle de billet rangé dans events.custom_fields : seuls les 10 modèles connus passent.
public class TicketSettingsTests
{
    [Fact]
    public void ReadsKnownStyleAndNote()
    {
        var (style, note) = TicketSettings.Read("""{"template":"Live","ticket":{"style":"concert","note":"  Tenue blanche exigée  "}}""");
        Assert.Equal(("concert", "Tenue blanche exigée"), (style, note));
    }

    [Theory]
    [InlineData("""{"ticket":{"style":"<script>"}}""")]
    [InlineData("""{"ticket":"concert"}""")]
    [InlineData("pas du json")]
    [InlineData("")]
    public void IgnoresUnknownOrMalformedValues(string customFields)
    {
        Assert.Equal((null, null), TicketSettings.Read(customFields));
    }

    [Fact]
    public void TruncatesLongNote()
    {
        var (_, note) = TicketSettings.Read("{\"ticket\":{\"note\":\"" + new string('a', 80) + "\"}}");
        Assert.Equal(40, note!.Length);
    }
}
