using Microsoft.Extensions.Caching.Memory;

namespace backend_EventMoment.Services
{
    // Blocage par compte après trop d'échecs de connexion. La limite par IP (Program.cs)
    // ne freine pas une attaque répartie sur de nombreuses adresses : celle-ci protège le
    // compte visé lui-même. Même traitement que l'adresse ait un compte ou non (aucune
    // énumération possible). Mémoire du processus : suffit pour une seule instance d'API.
    public sealed class LoginThrottle
    {
        public const string LockedMessage =
            "Trop de tentatives de connexion pour ce compte. Réessayez dans 15 minutes.";

        private readonly IMemoryCache _cache;
        private readonly int _maxFailures;
        private readonly TimeSpan _window;
        private readonly object _gate = new();

        public LoginThrottle(IMemoryCache cache, IConfiguration? config = null)
        {
            _cache = cache;
            _maxFailures = config?.GetValue("LoginThrottle:MaxFailures", 10) ?? 10;
            _window = TimeSpan.FromMinutes(config?.GetValue("LoginThrottle:LockMinutes", 15) ?? 15);
        }

        private static string Key(string scope, string email) => $"login:{scope}:{email.Trim().ToLowerInvariant()}";

        // Lève une exception si le compte est verrouillé (avant toute vérification du mot de passe).
        public void EnsureNotLocked(string scope, string email)
        {
            if (_cache.TryGetValue(Key(scope, email) + ":lock", out _))
                throw new InvalidOperationException(LockedMessage);
        }

        public void RecordFailure(string scope, string email)
        {
            var key = Key(scope, email);
            lock (_gate)
            {
                var failures = (_cache.TryGetValue(key, out int count) ? count : 0) + 1;
                if (failures >= _maxFailures)
                {
                    _cache.Set(key + ":lock", true, _window);
                    _cache.Remove(key);
                }
                else
                {
                    _cache.Set(key, failures, _window);
                }
            }
        }

        public void Reset(string scope, string email) => _cache.Remove(Key(scope, email));
    }
}
