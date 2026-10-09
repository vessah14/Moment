using backend_EventMoment.Dtos.User;

namespace backend_EventMoment.Interfaces
{
    public interface IUserService
    {
        Task<UtilisateurDtos> RegisterAsync(CreateUtilisateurDtos dtos);
        Task<UtilisateurDtos?> GetByIdAsync(Guid id);
        Task<List<UtilisateurDtos>> GetAllAsync();
        Task<UtilisateurDtos> UpdateAsync(Guid id, UpdateUtilisateurDtos dto);
        Task ChangePasswordAsync(Guid id, ChangePasswordDto dto);
        Task<bool> DeactivateAsync(Guid id);
        Task<LoginResponseDto> LoginAsync(LoginDto dto);
        Task<LoginResponseDto> LoginWithGoogleAsync(GoogleAuthDto dto);
        Task<LoginResponseDto> LoginWithFacebookAsync(FacebookAuthDto dto);
        Task RequestPasswordResetAsync(DemanderResetPasswordDto dto);
        Task ResetPasswordAsync(ResetPasswordDto dto);
        Task VerifyEmailAsync(VerifyEmailDto dto);
        Task ResendVerificationEmailAsync(Guid organizerId);
        Task<LoginResponseDto> RefreshTokenAsync(Guid organizerId);
    }
}
