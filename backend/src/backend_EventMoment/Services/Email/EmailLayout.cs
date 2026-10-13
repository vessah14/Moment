using System.Text;

namespace backend_EventMoment.Services.Email
{
    // Contenu d'un e-mail TBF MOMENT, mis en forme par EmailLayout.Render.
    // Les champs *Html sont insérés tels quels : les valeurs saisies par les utilisateurs
    // doivent y être encodées avec EmailLayout.E. Les autres champs sont encodés ici.
    public sealed class EmailMessage
    {
        // Texte d'aperçu affiché après l'objet dans la liste des e-mails.
        public string Preheader { get; init; } = "";
        // Petite ligne dorée en majuscules au-dessus du titre (« Invitation », « Sécurité »…).
        public string Kicker { get; init; } = "";
        public required string Title { get; init; }
        public string? Subtitle { get; init; }
        public required string BodyHtml { get; init; }
        // Encadré doré (information clé : date et lieu, offre, billet…).
        public EmailCallout? Callout { get; init; }
        public string? ButtonText { get; init; }
        public string? ButtonUrl { get; init; }
        // Petit texte gris sous le bouton (lien de secours, validité du lien…).
        public string? NoteHtml { get; init; }
        // Signature ; « L'équipe TBF MOMENT » par défaut.
        public string? SignatureHtml { get; init; }
        // Pourquoi le destinataire reçoit ce message (pied de page).
        public required string FooterReason { get; init; }
    }

    public sealed record EmailCallout(string Label, string Title, string? TextHtml = null);

    // Mise en page commune de tous les e-mails envoyés par la plateforme : tableaux et
    // styles en ligne (Gmail, Outlook, Apple Mail), sans image externe, lisible sur mobile.
    public static class EmailLayout
    {
        private const string Font = "font-family:Arial,Helvetica,sans-serif;";
        public const string DefaultSignature =
            "À très bientôt,<br><b>L'équipe TBF MOMENT</b>";

        // Seuls les caractères spéciaux HTML sont encodés : les accents restent lisibles.
        public static string E(string? value) => (value ?? "")
            .Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;")
            .Replace("\"", "&quot;").Replace("'", "&#39;");

        // Paragraphe du corps (contenu déjà sûr).
        public static string P(string html) => $"<p style=\"margin:0 0 16px;\">{html}</p>";

        // Lignes « libellé : valeur » (valeurs encodées ici), pour un encadré.
        public static string Lines(params (string Label, string? Value)[] lines) => string.Join("<br>",
            lines.Where(l => !string.IsNullOrWhiteSpace(l.Value))
                 .Select(l => $"<b style=\"color:#2B2547;\">{E(l.Label)}</b> {E(l.Value)}"));

        public static string Render(EmailMessage m)
        {
            var html = new StringBuilder();
            html.Append($$"""
                <!doctype html>
                <html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
                <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="x-apple-disable-message-reformatting">
                <title>{{E(m.Title)}}</title>
                <!--[if mso]><style>* { font-family: Arial, sans-serif !important; }</style><![endif]-->
                <style>
                  body { margin:0; padding:0; background:#EDEAF7; }
                  a { text-decoration:none; }
                  @media (max-width:620px){
                    .container { width:100% !important; }
                    .px { padding-left:24px !important; padding-right:24px !important; }
                    .h1 { font-size:28px !important; line-height:34px !important; }
                  }
                </style>
                </head>
                <body style="margin:0;padding:0;background:#EDEAF7;">
                  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{E(m.Preheader)}}</div>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EDEAF7;">
                    <tr>
                      <td align="center" style="padding:32px 12px;">
                        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#FFFFFF;border-radius:20px;overflow:hidden;">
                          <tr>
                            <td bgcolor="#0F0B2E" class="px" style="background:#0F0B2E;background-image:linear-gradient(135deg,#0F0B2E 0%,#2A1B6E 60%,#6C4BF4 130%);padding:36px 40px 40px;">
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td style="{{Font}}font-size:15px;font-weight:bold;letter-spacing:3px;color:#FFFFFF;">
                                    TBF <span style="color:#FF7A45;">MO</span><span style="color:#E23C9E;">ME</span><span style="color:#9B7BFF;">NT</span>
                                    <span style="color:#F5C451;">&#10022;</span>
                                  </td>
                                </tr>
                """);
            if (!string.IsNullOrWhiteSpace(m.Kicker))
                html.Append($"""
                                <tr>
                                  <td style="padding-top:34px;{Font}font-size:12px;letter-spacing:3px;color:#F5C451;text-transform:uppercase;">{E(m.Kicker)}</td>
                                </tr>
                """);
            html.Append($"""
                                <tr>
                                  <td class="h1" style="padding-top:{(string.IsNullOrWhiteSpace(m.Kicker) ? "30" : "10")}px;{Font}font-size:32px;line-height:39px;font-weight:bold;color:#FFFFFF;">{E(m.Title)}</td>
                                </tr>
                """);
            if (!string.IsNullOrWhiteSpace(m.Subtitle))
                html.Append($"""
                                <tr>
                                  <td style="padding-top:12px;{Font}font-size:16px;line-height:24px;color:#CFC8F2;">{E(m.Subtitle)}</td>
                                </tr>
                """);
            html.Append($"""
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td height="5" bgcolor="#E23C9E" style="height:5px;line-height:5px;font-size:0;background:#E23C9E;background-image:linear-gradient(90deg,#FF7A45,#E23C9E,#6C4BF4);">&nbsp;</td>
                          </tr>
                          <tr>
                            <td class="px" style="padding:36px 40px 4px;{Font}font-size:16px;line-height:26px;color:#2B2547;">{m.BodyHtml}</td>
                          </tr>
                """);
            if (m.Callout is { } c)
                html.Append($"""
                          <tr>
                            <td class="px" style="padding:12px 40px 16px;">
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFF7E3;border:1px solid #F5C451;border-radius:14px;">
                                <tr>
                                  <td style="padding:20px 24px;{Font}">
                                    <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#B7860B;font-weight:bold;">{E(c.Label)}</div>
                                    <div style="padding-top:8px;font-size:18px;line-height:26px;color:#2B2547;font-weight:bold;">{E(c.Title)}</div>
                                    {(c.TextHtml == null ? "" : $"<div style=\"padding-top:6px;font-size:14px;line-height:22px;color:#6A6385;\">{c.TextHtml}</div>")}
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                """);
            if (!string.IsNullOrWhiteSpace(m.ButtonText) && !string.IsNullOrWhiteSpace(m.ButtonUrl))
                html.Append($"""
                          <tr>
                            <td class="px" align="center" style="padding:14px 40px 10px;">
                              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td align="center" bgcolor="#6C4BF4" style="border-radius:12px;background:#6C4BF4;background-image:linear-gradient(100deg,#FF7A45,#E23C9E 50%,#6C4BF4);">
                                    <a href="{E(m.ButtonUrl)}" target="_blank" style="display:inline-block;padding:15px 30px;{Font}font-size:16px;font-weight:bold;color:#FFFFFF;border-radius:12px;">{E(m.ButtonText)}</a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                """);
            if (!string.IsNullOrWhiteSpace(m.NoteHtml))
                html.Append($"""
                          <tr>
                            <td class="px" align="center" style="padding:6px 40px 8px;{Font}font-size:13px;line-height:20px;color:#6A6385;">{m.NoteHtml}</td>
                          </tr>
                """);
            html.Append($"""
                          <tr>
                            <td class="px" style="padding:28px 40px 32px;{Font}font-size:15px;line-height:23px;color:#2B2547;">
                              <div style="border-top:1px solid #EEEAF8;padding-top:24px;">{m.SignatureHtml ?? DefaultSignature}</div>
                            </td>
                          </tr>
                          <tr>
                            <td bgcolor="#0F0B2E" class="px" align="center" style="background:#0F0B2E;padding:26px 40px;{Font}font-size:12px;line-height:19px;color:#A9A3CC;">
                              <span style="color:#FFFFFF;font-weight:bold;letter-spacing:2px;">Create<span style="color:#F5C451;">.</span> Connect<span style="color:#F5C451;">.</span> Celebrate<span style="color:#F5C451;">.</span></span><br><br>
                              <a href="https://tbfmoment.com" style="color:#CFC8F2;">tbfmoment.com</a> &nbsp;·&nbsp; Un produit <a href="https://tbfdesign.online" style="color:#CFC8F2;">TBF DIGITAL</a> &nbsp;·&nbsp; Douala, Cameroun<br><br>
                              {E(m.FooterReason)}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """);
            return html.ToString();
        }
    }
}
