using backend_EventMoment.Data;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    // Un compte non confirmé peut se connecter et préparer ses événements, mais publier,
    // payer ou faire envoyer des e-mails demande une adresse confirmée : un compte créé avec
    // l'adresse de quelqu'un d'autre ne sort jamais du brouillon.
    public static class EmailVerificationGuard
    {
        public const string Message =
            "Confirmez votre adresse e-mail pour continuer : cliquez sur le lien reçu, ou renvoyez-le depuis vos paramètres.";

        public static async Task EnsureAsync(AdminDbContext context, Guid organizerId)
        {
            if (!await context.OrganizerEmailVerifications.AnyAsync(v => v.OrganizerId == organizerId))
                throw new InvalidOperationException(Message);
        }
    }
}
