using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace backend_EventMoment.Data
{
    // Verrou PostgreSQL par organisateur, le temps d'une transaction : le contrôle d'une
    // limite d'offre (« 1 événement », « 50 invités ») et l'enregistrement qui suit se font
    // d'un bloc. Sans lui, deux requêtes simultanées passaient toutes deux le contrôle.
    // Base en mémoire (tests) : pas de transaction réelle, rien à verrouiller.
    public static class OrganizerLock
    {
        public static async Task<IDbContextTransaction?> BeginAsync(AdminDbContext context, Guid organizerId)
        {
            if (!context.Database.IsNpgsql() || context.Database.CurrentTransaction != null)
                return null;
            var transaction = await context.Database.BeginTransactionAsync();
            await context.Database.ExecuteSqlInterpolatedAsync(
                $"SELECT pg_advisory_xact_lock(hashtext({"organizer-limits:" + organizerId}))");
            return transaction;
        }
    }
}
