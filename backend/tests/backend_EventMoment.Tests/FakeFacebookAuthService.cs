using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Tests;

public class FakeFacebookAuthService : IFacebookAuthService
{
    public (string Subject, string? Email, string? Name)? Result { get; set; }

    public Task<(string Subject, string? Email, string? Name)> ValidateAccessTokenAsync(string accessToken)
    {
        if (Result == null)
            throw new InvalidOperationException("Jeton Facebook invalide.");
        return Task.FromResult(Result.Value);
    }

    // Code accepté → jeton fictif ; tout autre code est refusé comme par Facebook.
    public string ValidCode { get; set; } = "code-valide";

    public Task<string> ExchangeCodeAsync(string code) =>
        code == ValidCode
            ? Task.FromResult("jeton-obtenu-par-le-serveur")
            : throw new InvalidOperationException("Code Facebook invalide ou expiré. Recommencez la connexion.");
}
