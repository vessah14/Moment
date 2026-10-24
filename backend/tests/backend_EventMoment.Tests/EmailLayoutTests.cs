using backend_EventMoment.Services;
using backend_EventMoment.Services.Email;

namespace backend_EventMoment.Tests;

// Gabarit commun des e-mails : contenu saisi par les utilisateurs toujours encodé.
public class EmailLayoutTests
{
    [Fact]
    public void Render_EncodesTextFields_AndKeepsBrandAndButton()
    {
        var html = EmailLayout.Render(new EmailMessage
        {
            Preheader = "<img src=x>",
            Kicker = "Test",
            Title = "<script>alert(1)</script>",
            Subtitle = "\"><b>",
            BodyHtml = EmailLayout.P("Bonjour " + EmailLayout.E("<i>Awa</i>")),
            Callout = new EmailCallout("Label", "<u>titre</u>"),
            ButtonText = "Ouvrir",
            ButtonUrl = "https://tbfmoment.com/x?a=1&b=\"2\"",
            FooterReason = "<a href=evil>",
        });

        Assert.DoesNotContain("<script>", html);
        Assert.DoesNotContain("<img src=x>", html);
        Assert.DoesNotContain("<i>Awa</i>", html);
        Assert.DoesNotContain("<u>titre</u>", html);
        Assert.DoesNotContain("<a href=evil>", html);
        Assert.Contains("&lt;script&gt;", html);
        Assert.Contains("href=\"https://tbfmoment.com/x?a=1&amp;b=&quot;2&quot;\"", html);
        Assert.Contains("Create<span", html);
        Assert.Contains(EmailLayout.DefaultSignature, html);
    }

    [Fact]
    public void Invitation_UsesTheLayout_WithEventDetailsAndPersonalLink()
    {
        var (subject, html) = InvitationDispatcher.BuildMessage("Awa Diop", "Mariage <Awa & Paul>",
            new DateOnly(2027, 6, 12), new TimeOnly(15, 0), "Douala", "Paul", "https://tbfmoment.com/e/mariage?invite=abc");

        Assert.Equal("Invitation : Mariage <Awa & Paul>", subject);
        Assert.Contains("Mariage &lt;Awa &amp; Paul&gt;", html);
        Assert.Contains("Confirmer ma présence", html);
        Assert.Contains("https://tbfmoment.com/e/mariage?invite=abc", html);
        Assert.Contains("12 juin 2027 à 15h00", html);
        Assert.Contains("Douala", html);
    }
}
