using System.Net;

namespace backend_EventMoment.Services.Exceptions;

// Erreur du prestataire de paiement (SasPay) ou de sa configuration : le détail va dans les
// journaux du serveur, l'utilisateur ne voit qu'un message neutre (OWASP A02 / A10).
public sealed class PaymentProviderException(string message, HttpStatusCode? statusCode = null)
    : HttpRequestException(message, null, statusCode);
