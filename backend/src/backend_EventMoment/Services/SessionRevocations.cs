using Microsoft.Extensions.Caching.Memory;

namespace backend_EventMoment.Services
{
    // Sessions fermées par « Se déconnecter » : leur jeton (identifiant jti) est refusé
    // jusqu'à son expiration naturelle, au lieu de rester utilisable 30 minutes.
    public sealed class SessionRevocations(IMemoryCache cache)
    {
        private static string Key(string jti) => "revoked-session:" + jti;

        public void Revoke(string jti, DateTimeOffset expiresAt)
        {
            var remaining = expiresAt - DateTimeOffset.UtcNow;
            if (remaining > TimeSpan.Zero)
                cache.Set(Key(jti), true, remaining + TimeSpan.FromMinutes(1));
        }

        public bool IsRevoked(string? jti) => !string.IsNullOrEmpty(jti) && cache.TryGetValue(Key(jti), out _);
    }
}
