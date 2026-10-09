using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

public class EventSearchabilityTests
{
    [Fact]
    public void Searchable_only_when_the_organizer_opted_in()
    {
        Assert.True(EventSearchability.IsSearchable("{\"options\":{\"searchable\":true}}"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("{}")]
    [InlineData("{\"options\":{}}")]
    [InlineData("{\"options\":{\"searchable\":false}}")]
    [InlineData("{\"options\":{\"searchable\":\"true\"}}")]
    [InlineData("{\"options\":true}")]
    [InlineData("[1,2]")]
    [InlineData("{pas du json")]
    public void Private_by_default_and_on_malformed_data(string? customFields)
    {
        Assert.False(EventSearchability.IsSearchable(customFields));
    }
}
