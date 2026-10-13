using backend_EventMoment.Dtos;
using backend_EventMoment.Dtos.User;

namespace backend_EventMoment.Interfaces
{
    public interface IAdminAccountService
    {
        Task<AdminAccountDto> CreateAsync(CreateAdminAccountDto dto, Guid currentAdminId);
        Task<AdminAccountDto?> GetByIdAsync(Guid id);
        Task<List<AdminAccountDto>> GetAllAsync();
        Task<bool> DeactivateAsync(Guid id, Guid currentAdminId);
        // Mot de passe vérifié : renvoie l'étape de double authentification (jamais la session).
        Task<AdminLoginResponseDto> LoginAsync(LoginDto dto);
        Task<LoginResponseDto> CompleteMfaLoginAsync(AdminMfaLoginDto dto);
        Task<bool> ResetMfaAsync(Guid adminId, Guid currentAdminId);
    }
}