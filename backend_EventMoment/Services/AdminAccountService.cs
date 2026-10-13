using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Dtos.User;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using backend_EventMoment.Services.Exceptions;

namespace backend_EventMoment.Services
{
    public class AdminAccountService : IAdminAccountService
    {
        private readonly AdminDbContext _context;
        private readonly JwtService _jwtService;

        private readonly LoginThrottle? _throttle;
        private readonly IDataProtector _protector;

        public AdminAccountService(AdminDbContext context, JwtService jwtService, LoginThrottle? throttle = null,
            IDataProtectionProvider? dataProtection = null)
        {
            _context = context;
            _jwtService = jwtService;
            _throttle = throttle;
            // Secrets de double authentification chiffrés avant d'être stockés en base.
            _protector = (dataProtection ?? new EphemeralDataProtectionProvider()).CreateProtector("AdminMfa.Secret.v1");
        }

        public async Task<AdminAccountDto> CreateAsync(CreateAdminAccountDto dto, Guid currentAdminId)
        {
            if (await _context.AdminAccounts.AnyAsync(a => a.Email == dto.Email))
                throw new EmailAlreadyExistsException(dto.Email);

            var admin = new AdminAccount
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FullName = dto.FullName,
                Role = dto.Role,
                IsActive = true,
                CreatedBy = currentAdminId,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.AdminAccounts.Add(admin);
            await _context.SaveChangesAsync();

            return ToDto(admin);
        }

        public async Task<AdminAccountDto?> GetByIdAsync(Guid id)
        {
            var admin = await _context.AdminAccounts.FindAsync(id);
            return admin == null ? null : ToDto(admin);
        }

        public async Task<List<AdminAccountDto>> GetAllAsync()
        {
            return await _context.AdminAccounts
                .OrderBy(a => a.CreatedAt)
                .Select(a => new AdminAccountDto
                {
                    Id = a.Id,
                    Email = a.Email,
                    FullName = a.FullName,
                    Role = a.Role,
                    IsActive = a.IsActive,
                    CreatedBy = a.CreatedBy,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> DeactivateAsync(Guid id, Guid currentAdminId)
        {
            var admin = await _context.AdminAccounts.FindAsync(id);
            if (admin == null) return false;

            if (id == currentAdminId)
                throw new InvalidOperationException("Vous ne pouvez pas désactiver votre propre compte.");

            if (admin.Role == AdminRole.Superadmin && admin.IsActive
                && !await _context.AdminAccounts.AnyAsync(a => a.Id != id && a.IsActive && a.Role == AdminRole.Superadmin))
                throw new InvalidOperationException("Impossible de désactiver le dernier superadmin actif.");

            admin.IsActive = false;
            admin.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<AdminLoginResponseDto> LoginAsync(LoginDto dto)
        {
            _throttle?.EnsureNotLocked("admin", dto.Email);

            var admin = await _context.AdminAccounts
                .FirstOrDefaultAsync(a => a.Email == dto.Email);

            // BCrypt exécuté même pour un e-mail inconnu : temps de réponse identique,
            // pas d'énumération des comptes admin par chronométrage.
            var passwordOk = BCrypt.Net.BCrypt.Verify(dto.Password, admin?.PasswordHash ?? DummyPasswordHash);
            if (admin == null || !passwordOk)
            {
                _throttle?.RecordFailure("admin", dto.Email);
                throw new InvalidCredentialsException();
            }
            _throttle?.Reset("admin", dto.Email);

            if (!admin.IsActive)
                throw new AccountInactiveException();

            // Double authentification obligatoire : le mot de passe seul n'ouvre pas la console.
            var mfa = await _context.AdminMfas.FirstOrDefaultAsync(m => m.AdminId == admin.Id);
            var (mfaToken, _) = _jwtService.GenerateAdminMfaToken(admin);
            if (mfa?.EnabledAt != null)
                return new AdminLoginResponseDto { MfaRequired = true, MfaToken = mfaToken, Utilisateur = new { } };

            // Premier passage (ou configuration jamais terminée) : nouveau secret à enregistrer
            // dans l'application d'authentification.
            var secret = Totp.GenerateSecret();
            if (mfa == null)
            {
                mfa = new AdminMfa { AdminId = admin.Id };
                _context.AdminMfas.Add(mfa);
            }
            mfa.SecretProtected = _protector.Protect(secret);
            mfa.LastUsedStep = 0;
            await _context.SaveChangesAsync();

            return new AdminLoginResponseDto
            {
                MfaRequired = true,
                MfaSetupRequired = true,
                MfaToken = mfaToken,
                MfaSecret = secret,
                OtpAuthUri = Totp.ProvisioningUri(admin.Email, secret),
                Utilisateur = new { },
            };
        }

        // Seconde étape : code de l'application d'authentification.
        public async Task<LoginResponseDto> CompleteMfaLoginAsync(AdminMfaLoginDto dto)
        {
            const string invalid = "Code invalide ou expiré.";
            if (!_jwtService.TryValidateAdminMfaToken(dto.MfaToken, out var adminId, out var version))
                throw new InvalidOperationException("Étape expirée : reconnectez-vous.");

            var admin = await _context.AdminAccounts.FirstOrDefaultAsync(a => a.Id == adminId && a.IsActive);
            if (admin == null || admin.UpdatedAt.ToUnixTimeMilliseconds() != version)
                throw new InvalidOperationException("Étape expirée : reconnectez-vous.");

            _throttle?.EnsureNotLocked("admin-mfa", admin.Email);
            var mfa = await _context.AdminMfas.FirstOrDefaultAsync(m => m.AdminId == admin.Id)
                ?? throw new InvalidOperationException("Étape expirée : reconnectez-vous.");

            var step = Totp.Verify(_protector.Unprotect(mfa.SecretProtected), dto.Code, mfa.LastUsedStep, DateTimeOffset.UtcNow);
            if (step == null)
            {
                _throttle?.RecordFailure("admin-mfa", admin.Email);
                throw new InvalidOperationException(invalid);
            }
            _throttle?.Reset("admin-mfa", admin.Email);

            mfa.LastUsedStep = step.Value;
            mfa.EnabledAt ??= DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            var (token, expiration) = _jwtService.GenerateAdminToken(admin);
            return new LoginResponseDto
            {
                Token = token,
                Expiration = expiration,
                Utilisateur = new AdminAccountDto
                {
                    Id = admin.Id,
                    Email = admin.Email,
                    FullName = admin.FullName,
                    Role = admin.Role,
                    IsActive = admin.IsActive,
                    CreatedBy = admin.CreatedBy,
                    CreatedAt = admin.CreatedAt
                }
            };
        }

        // Téléphone perdu : un super-administrateur réinitialise la double authentification
        // d'un autre compte, qui la reconfigurera à sa prochaine connexion.
        public async Task<bool> ResetMfaAsync(Guid adminId, Guid currentAdminId)
        {
            if (adminId == currentAdminId)
                throw new InvalidOperationException("Vous ne pouvez pas réinitialiser votre propre double authentification.");
            var mfa = await _context.AdminMfas.FirstOrDefaultAsync(m => m.AdminId == adminId);
            if (mfa == null) return false;
            _context.AdminMfas.Remove(mfa);
            await _context.SaveChangesAsync();
            return true;
        }

        private static readonly string DummyPasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N"));

        private static AdminAccountDto ToDto(AdminAccount admin) => new()
        {
            Id = admin.Id,
            Email = admin.Email,
            FullName = admin.FullName,
            Role = admin.Role,
            IsActive = admin.IsActive,
            CreatedBy = admin.CreatedBy,
            CreatedAt = admin.CreatedAt
        };
    }
}