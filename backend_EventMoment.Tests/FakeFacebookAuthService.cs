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
}
