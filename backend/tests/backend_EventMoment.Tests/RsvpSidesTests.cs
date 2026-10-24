using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

// Choix « côté » du bloc RSVP : liste nettoyée, et seuls ses choix sont acceptés.
public class RsvpSidesTests
{
    [Fact]
    public void ReadsTrimmedDistinctChoices()
    {
        var sides = RsvpSides.Read("""{"sides":[" Opérations ","","Commercial","Opérations",3,"Direction"]}""");
        Assert.Equal(new[] { "Opérations", "Commercial", "Direction" }, sides);
    }

    [Fact]
    public void KeepsAtMostEightChoices_OfLimitedLength()
    {
        var many = string.Join(",", Enumerable.Range(1, 12).Select(i => $"\"Choix {i}\""));
        Assert.Equal(RsvpSides.MaxSides, RsvpSides.Read("{\"sides\":[" + many + "]}").Count);
        Assert.Equal(RsvpSides.MaxLength, RsvpSides.Read("{\"sides\":[\"" + new string('a', 200) + "\"]}")[0].Length);
    }

    [Theory]
    [InlineData("""{"sides":"Famille"}""")]
    [InlineData("pas du json")]
    [InlineData("")]
    [InlineData(null)]
    public void IgnoresMalformedContent(string? content)
    {
        Assert.Empty(RsvpSides.Read(content));
    }

    [Fact]
    public void ValidatesAgainstTheList()
    {
        const string content = """{"sides":["C'est une fille","C'est un garçon"]}""";
        Assert.Equal("C'est une fille", RsvpSides.Validate(content, " C'est une fille "));
        Assert.Null(RsvpSides.Validate(content, "  "));
        Assert.Throws<InvalidOperationException>(() => RsvpSides.Validate(content, "Jumeaux"));
        Assert.Throws<InvalidOperationException>(() => RsvpSides.Validate("{}", "Famille"));
    }
}
