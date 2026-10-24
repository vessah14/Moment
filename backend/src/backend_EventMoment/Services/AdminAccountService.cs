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

        public AdminAccountService(AdminDbContext context, JwtService jwtService, LoginThrottle? throttle = null)
        {
            _context = context;
            _jwtService = jwtService;
            _throttle = throttle;
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

        public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
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

            var (token, expiration) = _jwtService.GenerateAdminToken(admin);
            return new LoginResponseDto
            {
                Token = token,
                Expiration = expiration,
                Utilisateur = ToDto(admin),
            };
        }

        // Permet de supprimer les données d'une ancienne configuration MFA.
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