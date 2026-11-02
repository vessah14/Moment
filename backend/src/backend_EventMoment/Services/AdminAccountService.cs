using System.Security.Cryptography;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Dtos.User;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using backend_EventMoment.Services.Email;
using backend_EventMoment.Services.Exceptions;

namespace backend_EventMoment.Services
{
    public class AdminAccountService : IAdminAccountService
    {
        private readonly AdminDbContext _context;
        private readonly JwtService _jwtService;

        private readonly LoginThrottle? _throttle;
        private readonly IDataProtector _mfaProtector;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AdminAccountService> _logger;

        public AdminAccountService(
            AdminDbContext context,
            JwtService jwtService,
            IDataProtectionProvider dataProtection,
            IEmailSender emailSender,
            IConfiguration configuration,
            ILogger<AdminAccountService> logger,
            LoginThrottle? throttle = null)
        {
            _context = context;
            _jwtService = jwtService;
            _throttle = throttle;
            _mfaProtector = dataProtection.CreateProtector("AdminMfa.Secret.v1");
            _emailSender = emailSender;
            _configuration = configuration;
            _logger = logger;
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

            var mfa = await _context.AdminMfas.FirstOrDefaultAsync(m => m.AdminId == admin.Id);
            var (mfaToken, _) = _jwtService.GenerateAdminMfaToken(admin);
            if (mfa?.EnabledAt != null)
                return new AdminLoginResponseDto
                {
                    MfaRequired = true,
                    MfaToken = mfaToken,
                };

            string secret;
            if (mfa == null)
            {
                secret = Totp.GenerateSecret();
                mfa = new AdminMfa
                {
                    AdminId = admin.Id,
                    SecretProtected = _mfaProtector.Protect(secret),
                };
                _context.AdminMfas.Add(mfa);
            }
            else
            {
                try
                {
                    secret = _mfaProtector.Unprotect(mfa.SecretProtected);
                }
                catch (CryptographicException)
                {
                    secret = Totp.GenerateSecret();
                    mfa.SecretProtected = _mfaProtector.Protect(secret);
                    mfa.LastUsedStep = 0;
                }
            }
            await _context.SaveChangesAsync();

            return new AdminLoginResponseDto
            {
                MfaRequired = true,
                MfaSetupRequired = true,
                MfaToken = mfaToken,
                MfaSecret = secret,
                OtpAuthUri = Totp.ProvisioningUri(admin.Email, secret),
            };
        }

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

            string secret;
            try
            {
                secret = _mfaProtector.Unprotect(mfa.SecretProtected);
            }
            catch (CryptographicException)
            {
                throw new InvalidOperationException(
                    "La double authentification doit être réinitialisée par un autre superadmin.");
            }

            var step = Totp.Verify(secret, dto.Code, mfa.LastUsedStep, DateTimeOffset.UtcNow);
            if (step == null)
            {
                _throttle?.RecordFailure("admin-mfa", admin.Email);
                throw new InvalidOperationException(invalid);
            }

            mfa.LastUsedStep = step.Value;
            mfa.EnabledAt ??= DateTimeOffset.UtcNow;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                _throttle?.RecordFailure("admin-mfa", admin.Email);
                throw new InvalidOperationException(invalid);
            }

            _throttle?.Reset("admin-mfa", admin.Email);
            var (token, expiration) = _jwtService.GenerateAdminToken(admin);
            return new LoginResponseDto
            {
                Token = token,
                Expiration = expiration,
                Utilisateur = ToDto(admin),
            };
        }

        public async Task RequestMfaRecoveryAsync(string email)
        {
            if (_throttle != null && !_throttle.TryRecordAttempt("admin-mfa-recovery", email))
                return;

            var admin = await _context.AdminAccounts.AsNoTracking()
                .FirstOrDefaultAsync(a => a.Email == email && a.IsActive);
            if (admin == null || !await _context.AdminMfas.AnyAsync(m => m.AdminId == admin.Id && m.EnabledAt != null))
                return;

            var (token, _) = _jwtService.GenerateAdminMfaRecoveryToken(admin);
            var adminUrl = _configuration["Frontend:AdminUrl"]?.TrimEnd('/');
            if (string.IsNullOrWhiteSpace(adminUrl))
            {
                _logger.LogError("Frontend:AdminUrl n'est pas configurée : récupération MFA impossible pour l'administrateur {AdminId}", admin.Id);
                return;
            }

            var recoveryUrl = $"{adminUrl}/admin/recuperation-mfa#token={Uri.EscapeDataString(token)}";
            var html = EmailLayout.Render(new EmailMessage
            {
                Preheader = "Lien de récupération MFA valable 20 minutes.",
                Kicker = "Sécurité du compte",
                Title = "Récupération de votre accès admin",
                BodyHtml = EmailLayout.P("Une demande de réinitialisation de la double authentification de votre compte administrateur a été reçue.")
                    + EmailLayout.P("Si vous êtes à l'origine de cette demande, utilisez le bouton ci-dessous. Vous devrez ensuite vous reconnecter avec votre mot de passe et configurer une nouvelle application d'authentification.")
                    + EmailLayout.P("Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre MFA reste active."),
                ButtonText = "Réinitialiser mon MFA",
                ButtonUrl = recoveryUrl,
                NoteHtml = "Ce lien expire dans 20 minutes et ne peut servir qu'une seule fois.",
                FooterReason = "Vous recevez cet e-mail suite à une demande de récupération MFA pour votre compte administrateur TBF MOMENT.",
            });

            try
            {
                if (!await _emailSender.SendAsync(admin.Email, "Récupération MFA de votre compte admin TBF MOMENT", html))
                    _logger.LogWarning("E-mail de récupération MFA non envoyé pour l'administrateur {AdminId}", admin.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Échec de l'envoi de l'e-mail de récupération MFA pour l'administrateur {AdminId}", admin.Id);
            }
        }

        public async Task CompleteMfaRecoveryAsync(AdminMfaRecoveryDto dto)
        {
            if (!_jwtService.TryValidateAdminMfaRecoveryToken(dto.Token, out var adminId, out var version))
                throw new InvalidOperationException("Lien de récupération invalide ou expiré.");

            var admin = await _context.AdminAccounts.FirstOrDefaultAsync(a => a.Id == adminId && a.IsActive);
            if (admin == null || admin.UpdatedAt.ToUnixTimeMilliseconds() != version)
                throw new InvalidOperationException("Lien de récupération invalide ou expiré.");

            var mfa = await _context.AdminMfas.FirstOrDefaultAsync(m => m.AdminId == admin.Id && m.EnabledAt != null);
            if (mfa == null)
                throw new InvalidOperationException("Lien de récupération invalide ou expiré.");

            _context.AdminMfas.Remove(mfa);
            var now = DateTimeOffset.UtcNow;
            admin.UpdatedAt = now.ToUnixTimeMilliseconds() <= version
                ? DateTimeOffset.FromUnixTimeMilliseconds(version + 1)
                : now;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new InvalidOperationException("Lien de récupération invalide ou expiré.");
            }
        }

        // Permet de supprimer les données d'une ancienne configuration MFA.
        public async Task<bool> ResetMfaAsync(Guid adminId, Guid currentAdminId)
        {
            if (adminId == currentAdminId)
                throw new InvalidOperationException("Vous ne pouvez pas réinitialiser votre propre double authentification.");
            var mfa = await _context.AdminMfas.FirstOrDefaultAsync(m => m.AdminId == adminId);
            if (mfa == null) return false;
            _context.AdminMfas.Remove(mfa);
            var admin = await _context.AdminAccounts.FirstOrDefaultAsync(a => a.Id == adminId);
            if (admin != null)
            {
                var now = DateTimeOffset.UtcNow;
                admin.UpdatedAt = now.ToUnixTimeMilliseconds() <= admin.UpdatedAt.ToUnixTimeMilliseconds()
                    ? DateTimeOffset.FromUnixTimeMilliseconds(admin.UpdatedAt.ToUnixTimeMilliseconds() + 1)
                    : now;
            }
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