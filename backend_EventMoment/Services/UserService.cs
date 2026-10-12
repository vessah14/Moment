using backend_EventMoment.Data;
using backend_EventMoment.Dtos.User;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using backend_EventMoment.Services.Email;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class UserService : IUserService
    {
        private readonly AdminDbContext _adminContext;
        private readonly SignupDbContext _signupContext;
        private readonly JwtService _jwtService;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _config;
        private readonly IFacebookAuthService _facebookAuthService;
        private readonly IGoogleAuthService? _googleAuthService;

        public UserService(
            AdminDbContext adminContext,
            SignupDbContext signupContext,
            JwtService jwtService,
            IEmailSender emailSender,
            IConfiguration config,
            IFacebookAuthService facebookAuthService,
            IGoogleAuthService? googleAuthService = null)
        {
            _adminContext = adminContext;
            _signupContext = signupContext;
            _jwtService = jwtService;
            _emailSender = emailSender;
            _config = config;
            _facebookAuthService = facebookAuthService;
            _googleAuthService = googleAuthService;
        }

        public const string InvalidCredentialsMessage = "E-mail ou mot de passe incorrect.";
        public const string EmailNotVerifiedMessage =
            "Confirmez d'abord votre adresse e-mail : nous venons de vous renvoyer le lien de confirmation.";

        // Inscription : la réponse est toujours la même, que l'adresse soit libre ou déjà
        // utilisée (sinon le formulaire révélerait quelles adresses ont un compte). Le compte
        // ne sert qu'après confirmation de l'adresse par le lien reçu par e-mail.
        public async Task RegisterAsync(CreateUtilisateurDtos dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FullName))
                throw new InvalidOperationException("Le nom est requis.");

            if (!string.Equals(dto.Password, dto.ConfirmPassword, StringComparison.Ordinal))
                throw new InvalidOperationException("Les mots de passe ne correspondent pas.");

            var utilisateur = new Utilisateur
            {
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FullName = dto.FullName,
                Phone = dto.Phone
                // Id, IsActive, CreatedAt, UpdatedAt : générés par défaut en base,
                // app_signup n'a pas le droit de les fixer explicitement
            };

            // Le mot de passe est haché ci-dessus dans tous les cas : même temps de réponse
            // que l'adresse soit libre ou non. La contrainte d'unicité reste le filet de
            // sécurité si deux inscriptions arrivent en même temps.
            if (await _signupContext.Organizers.AnyAsync(o => o.Email == dto.Email))
            {
                await NotifyExistingAccountAsync(dto.Email);
                return;
            }

            _signupContext.Organizers.Add(utilisateur);

            try
            {
                await _signupContext.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex))
            {
                _signupContext.Entry(utilisateur).State = EntityState.Detached;
                await NotifyExistingAccountAsync(dto.Email);
                return;
            }

            await SendVerificationEmailAsync(utilisateur);
        }

        // Adresse déjà inscrite : on prévient son titulaire (et lui seul) plutôt que de
        // l'afficher à la personne qui remplit le formulaire.
        private async Task NotifyExistingAccountAsync(string email)
        {
            var existing = await _adminContext.Organizers.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(o => o.Email == email);
            if (existing == null || !existing.IsActive)
                return;

            // Jamais confirmé : la personne a sans doute perdu le premier e-mail.
            if (!await IsEmailVerifiedAsync(existing.Id))
            {
                await SendVerificationEmailAsync(existing);
                return;
            }

            var baseUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";
            var html = EmailLayout.Render(new EmailMessage
            {
                Preheader = "Une inscription a été tentée avec votre adresse : vous avez déjà un compte.",
                Kicker = "Sécurité du compte",
                Title = "Vous avez déjà un compte",
                BodyHtml = EmailLayout.P($"Bonjour {EmailLayout.E(existing.FullName)},")
                    + EmailLayout.P("Quelqu'un (peut-être vous) a essayé de créer un compte TBF MOMENT avec cette adresse. "
                        + "Elle est déjà associée à votre compte : aucun nouveau compte n'a été créé.")
                    + EmailLayout.P("Vous pouvez vous connecter directement, ou choisir un nouveau mot de passe si vous l'avez oublié."),
                ButtonText = "Me connecter",
                ButtonUrl = $"{baseUrl}/connexion",
                NoteHtml = $"Mot de passe oublié ? <a href=\"{EmailLayout.E(baseUrl)}/mot-de-passe-oublie\" style=\"color:#6C4BF4;\">Le réinitialiser</a>.<br>"
                    + "Si ce n'était pas vous, ignorez cet e-mail : votre compte n'a pas été modifié.",
                FooterReason = "Vous recevez cet e-mail suite à une tentative d'inscription avec votre adresse sur tbfmoment.com.",
            });
            try
            {
                await _emailSender.SendAsync(existing.Email, "Vous avez déjà un compte TBF Moment", html);
            }
            catch
            {
                // Même réponse que pour une inscription réussie, e-mail envoyé ou non.
            }
        }

        // Renvoi du lien de confirmation depuis la page de connexion (sans être connecté) :
        // ne dit jamais si l'adresse a un compte.
        public async Task ResendVerificationByEmailAsync(string email)
        {
            var organizer = await _adminContext.Organizers.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(o => o.Email == email && o.IsActive);
            if (organizer != null && !await IsEmailVerifiedAsync(organizer.Id))
                await SendVerificationEmailAsync(organizer);
        }

        public async Task<UtilisateurDtos?> GetByIdAsync(Guid id)
        {
            var entity = await _adminContext.Organizers
                .FirstOrDefaultAsync(u => u.Id == id);

            return entity == null ? null : ToDto(entity, await IsEmailVerifiedAsync(entity.Id));
        }

        public async Task<List<UtilisateurDtos>> GetAllAsync()
        {
            var users = await _adminContext.Organizers
                .OrderBy(u => u.CreatedAt)
                .ToListAsync();

            var verified = (await _adminContext.OrganizerEmailVerifications.AsNoTracking()
                .Select(v => v.OrganizerId)
                .ToListAsync()).ToHashSet();
            return users.Select(u => ToDto(u, verified.Contains(u.Id))).ToList();
        }

        public async Task<UtilisateurDtos> UpdateAsync(Guid id, UpdateUtilisateurDtos dto)
        {
            var entity = await _adminContext.Organizers.FirstOrDefaultAsync(u => u.Id == id);
            if (entity == null)
                throw new KeyNotFoundException($"Utilisateur {id} introuvable.");

            entity.FullName = dto.FullName;
            entity.Phone = dto.Phone;
            // UpdatedAt n'est pas touché ici : il sert de "session_version" pour le
            // token JWT (voir Program.cs), la mise à jour du profil ne doit pas
            // invalider la session en cours. Voir ChangePasswordAsync/DeactivateAsync
            // pour les changements qui doivent réellement révoquer les jetons actifs.
            await _adminContext.SaveChangesAsync();
            return ToDto(entity, await IsEmailVerifiedAsync(entity.Id));
        }

        public async Task ChangePasswordAsync(Guid id, ChangePasswordDto dto)
        {
            var entity = await _adminContext.Organizers.FirstOrDefaultAsync(u => u.Id == id);
            if (entity == null)
                throw new KeyNotFoundException($"Utilisateur {id} introuvable.");

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, entity.PasswordHash))
                throw new InvalidOperationException("Mot de passe actuel incorrect.");

            entity.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            entity.UpdatedAt = DateTimeOffset.UtcNow;
            await _adminContext.SaveChangesAsync();
        }

        public async Task<bool> DeactivateAsync(Guid id)
        {
            var entity = await _adminContext.Organizers
                .FirstOrDefaultAsync(u => u.Id == id);

            if (entity == null)
                return false;

            entity.IsActive = false;
            entity.UpdatedAt = DateTimeOffset.UtcNow;
            await _adminContext.SaveChangesAsync();
            return true;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _adminContext.Organizers
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            // Toujours exécuter un BCrypt.Verify, même pour un e-mail inconnu : sinon la
            // réponse est nettement plus rapide et révèle quels e-mails ont un compte.
            var passwordOk = BCrypt.Net.BCrypt.Verify(dto.Password, user?.PasswordHash ?? DummyPasswordHash);
            // Même message que l'e-mail soit inconnu ou le mot de passe faux.
            if (user == null || !passwordOk)
                throw new InvalidOperationException(InvalidCredentialsMessage);

            // Ces deux cas ne sont signalés qu'avec le bon mot de passe : ils ne révèlent rien
            // à quelqu'un qui teste des adresses.
            if (!user.IsActive)
                throw new InvalidOperationException("Ce compte a été désactivé.");

            if (!await IsEmailVerifiedAsync(user.Id))
            {
                await SendVerificationEmailAsync(user);
                throw new InvalidOperationException(EmailNotVerifiedMessage);
            }

            var (token, expiration) = _jwtService.GenerateOrganizerToken(user);

            return new LoginResponseDto
            {
                Token = token,
                Expiration = expiration,
                Utilisateur = ToDto(user, await IsEmailVerifiedAsync(user.Id))
            };
        }

        public async Task<LoginResponseDto> LoginWithGoogleAsync(GoogleAuthDto dto)
        {
            // Jeton d'accès : bouton du site, qui ouvre lui-même la fenêtre Google.
            if (!string.IsNullOrWhiteSpace(dto.AccessToken))
            {
                if (_googleAuthService == null)
                    throw new InvalidOperationException("La connexion Google n'est pas configurée sur ce serveur.");
                var (subject, email, emailVerified, name) = await _googleAuthService.ValidateAccessTokenAsync(dto.AccessToken);
                if (!emailVerified)
                    throw new InvalidOperationException("Adresse email Google non vérifiée.");
                return BuildLoginResponse(await FindOrCreateExternalOrganizerAsync("google", subject, email, name));
            }
            if (string.IsNullOrWhiteSpace(dto.IdToken))
                throw new InvalidOperationException("Jeton Google manquant.");

            var clientId = _config["Authentication:Google:ClientId"];
            if (string.IsNullOrWhiteSpace(clientId))
                throw new InvalidOperationException("La connexion Google n'est pas configurée sur ce serveur.");

            GoogleJsonWebSignature.Payload payload;
            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { clientId }
                });
            }
            // Jeton mal formé (base64 ou JSON illisible) : même réponse qu'un jeton refusé,
            // plutôt qu'une erreur 500.
            catch (Exception ex) when (ex is InvalidJwtException or Newtonsoft.Json.JsonException or FormatException or ArgumentException)
            {
                throw new InvalidOperationException("Jeton Google invalide.");
            }

            if (!payload.EmailVerified)
                throw new InvalidOperationException("Adresse email Google non vérifiée.");

            var organizer = await FindOrCreateExternalOrganizerAsync("google", payload.Subject, payload.Email, payload.Name);
            return BuildLoginResponse(organizer);
        }

        public async Task<LoginResponseDto> LoginWithFacebookAsync(FacebookAuthDto dto)
        {
            var (subject, email, name) = await _facebookAuthService.ValidateAccessTokenAsync(dto.AccessToken);

            // Facebook ne renvoie le champ "email" que si l'utilisateur a accordé la
            // permission "email" ET possède une adresse vérifiée sur son compte — dans ce
            // cas Facebook garantit déjà qu'elle est vérifiée, il n'y a pas de flag séparé
            // à contrôler comme pour Google.
            if (string.IsNullOrWhiteSpace(email))
                throw new InvalidOperationException("Facebook n'a fourni aucune adresse email. Autorisez le partage de votre email pour continuer.");

            var organizer = await FindOrCreateExternalOrganizerAsync("facebook", subject, email, name);
            return BuildLoginResponse(organizer);
        }

        // Partagé par Google et Facebook : le rôle app_signup (seul) a les droits SELECT + INSERT
        // nécessaires ici, à la fois sur organizers et sur external_logins — cf. LoginAsync qui
        // lit via app_admin (SELECT/UPDATE uniquement) et RegisterAsync qui écrit via app_signup.
        private async Task<Utilisateur> FindOrCreateExternalOrganizerAsync(
            string provider, string providerUserId, string email, string? fullNameForNewAccount)
        {
            var externalLogin = await _signupContext.ExternalLogins
                .FirstOrDefaultAsync(x => x.Provider == provider && x.ProviderUserId == providerUserId);

            Utilisateur organizer;
            if (externalLogin != null)
            {
                var existing = await _signupContext.Organizers.FirstOrDefaultAsync(o => o.Id == externalLogin.OrganizerId);
                if (existing == null)
                    throw new InvalidOperationException("Compte introuvable.");
                organizer = existing;
            }
            else
            {
                var byEmail = await _signupContext.Organizers.FirstOrDefaultAsync(o => o.Email == email);
                if (byEmail != null)
                {
                    organizer = byEmail;

                    // Protection contre le pré-détournement de compte : n'importe qui peut
                    // s'inscrire avec l'adresse d'un tiers sans la vérifier. Si ce compte
                    // mot-de-passe n'a jamais été vérifié, le propriétaire réel de l'adresse
                    // (prouvé par Google/Facebook) en prend le contrôle : le mot de passe
                    // posé par l'inscrivant est remplacé et ses sessions sont révoquées.
                    if (!await IsEmailVerifiedAsync(organizer.Id))
                        await RevokePasswordAndSessionsAsync(organizer);
                }
                else
                {
                    organizer = new Utilisateur
                    {
                        Email = email,
                        // Compte créé uniquement via un fournisseur externe : personne ne doit
                        // connaître ce mot de passe. L'utilisateur peut en définir un plus tard
                        // via "mot de passe oublié".
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N")),
                        FullName = string.IsNullOrWhiteSpace(fullNameForNewAccount) ? email : fullNameForNewAccount,
                        Phone = null
                    };
                    _signupContext.Organizers.Add(organizer);
                    await _signupContext.SaveChangesAsync();
                }

                _signupContext.ExternalLogins.Add(new ExternalLogin
                {
                    OrganizerId = organizer.Id,
                    Provider = provider,
                    ProviderUserId = providerUserId
                });
                await _signupContext.SaveChangesAsync();
            }

            if (!organizer.IsActive)
                throw new InvalidOperationException("Ce compte a été désactivé.");

            // Le fournisseur a vérifié cette adresse (email_verified Google, email Facebook).
            if (string.Equals(organizer.Email, email, StringComparison.OrdinalIgnoreCase))
                await MarkEmailVerifiedAsync(organizer.Id);

            return organizer;
        }

        private async Task RevokePasswordAndSessionsAsync(Utilisateur organizer)
        {
            var tracked = await _adminContext.Organizers.IgnoreQueryFilters()
                .FirstOrDefaultAsync(o => o.Id == organizer.Id)
                ?? throw new InvalidOperationException("Compte introuvable.");

            tracked.PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N"));
            tracked.UpdatedAt = DateTimeOffset.UtcNow;
            await _adminContext.SaveChangesAsync();

            // Le jeton de session est calculé à partir de UpdatedAt : il doit refléter la
            // nouvelle valeur, sinon le jeton émis juste après serait immédiatement refusé.
            organizer.PasswordHash = tracked.PasswordHash;
            organizer.UpdatedAt = tracked.UpdatedAt;

            // L'objet vient de SignupDbContext (app_signup : SELECT/INSERT seulement). La
            // modification est déjà enregistrée via app_admin : il ne doit pas la ré-écrire
            // au prochain SaveChanges, sinon UPDATE organizers -> « droit refusé ».
            var entry = _signupContext.Entry(organizer);
            if (entry.State == EntityState.Modified)
                entry.State = EntityState.Unchanged;
        }

        private Task<bool> IsEmailVerifiedAsync(Guid organizerId) =>
            _adminContext.OrganizerEmailVerifications.AnyAsync(v => v.OrganizerId == organizerId);

        private async Task MarkEmailVerifiedAsync(Guid organizerId)
        {
            if (await IsEmailVerifiedAsync(organizerId))
                return;

            _adminContext.OrganizerEmailVerifications.Add(new OrganizerEmailVerification
            {
                OrganizerId = organizerId,
                VerifiedAt = DateTimeOffset.UtcNow
            });

            try
            {
                await _adminContext.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex))
            {
                // Deux requêtes simultanées : l'autre a déjà enregistré la vérification.
            }
        }

        private async Task SendVerificationEmailAsync(Utilisateur organizer)
        {
            var (token, _) = _jwtService.GenerateEmailVerificationToken(organizer);
            var baseUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";
            var link = $"{baseUrl}/verifier-email?token={Uri.EscapeDataString(token)}";

            var html = EmailLayout.Render(new EmailMessage
            {
                Preheader = "Confirmez votre adresse pour activer votre compte TBF MOMENT.",
                Kicker = "Bienvenue",
                Title = "Bienvenue dans l'aventure ! 🎉",
                Subtitle = "Merci d'avoir rejoint TBF MOMENT.",
                BodyHtml = EmailLayout.P($"Bonjour {EmailLayout.E(organizer.FullName)},")
                    + EmailLayout.P("Votre compte est créé. <b>TBF MOMENT</b> réunit tout votre événement dans <b>un seul lien</b> : "
                        + "invitations, confirmations de présence, programme, galerie, billetterie…")
                    + EmailLayout.P("Il ne reste qu'une étape : confirmez votre adresse e-mail pour sécuriser votre compte."),
                ButtonText = "Confirmer mon adresse e-mail",
                ButtonUrl = link,
                NoteHtml = "Ce lien est valable 48 heures. Si vous n'avez pas créé de compte, ignorez simplement cet e-mail.",
                FooterReason = "Vous recevez cet e-mail car un compte a été créé avec cette adresse sur tbfmoment.com.",
            });

            try
            {
                await _emailSender.SendAsync(organizer.Email, "Confirmez votre adresse e-mail TBF Moment", html);
            }
            catch
            {
                // L'inscription ne doit pas échouer parce que le SMTP est indisponible :
                // l'utilisateur peut redemander le lien depuis ses paramètres.
            }
        }

        public async Task VerifyEmailAsync(VerifyEmailDto dto)
        {
            if (!_jwtService.TryValidateEmailVerificationToken(dto.Token, out var organizerId, out var email))
                throw new InvalidOperationException("Lien de vérification invalide ou expiré.");

            var organizer = await _adminContext.Organizers.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == organizerId && o.IsActive);
            if (organizer == null || !string.Equals(organizer.Email, email, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Lien de vérification invalide ou expiré.");

            await MarkEmailVerifiedAsync(organizerId);
        }

        // Renouvelle le jeton d'une session encore valide (le middleware a déjà vérifié la
        // signature, l'expiration et session_version : un mot de passe changé ou un compte
        // désactivé coupe toujours la session). Sans ça, l'organisateur était déconnecté
        // net toutes les 30 minutes, en plein travail dans le Builder.
        public async Task<LoginResponseDto?> RefreshTokenAsync(Guid organizerId, DateTimeOffset? authTime)
        {
            // Jeton d'avant l'ajout de auth_time : la durée maximale part de maintenant.
            var since = authTime ?? DateTimeOffset.UtcNow;
            if (DateTimeOffset.UtcNow - since > _jwtService.MaxSessionLifetime)
                return null;

            var organizer = await _adminContext.Organizers.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == organizerId && o.IsActive)
                ?? throw new KeyNotFoundException("Compte introuvable.");

            var (token, expiration) = _jwtService.GenerateOrganizerToken(organizer, since);
            return new LoginResponseDto
            {
                Token = token,
                Expiration = expiration,
                Utilisateur = ToDto(organizer, await IsEmailVerifiedAsync(organizer.Id))
            };
        }

        public async Task ResendVerificationEmailAsync(Guid organizerId)
        {
            var organizer = await _adminContext.Organizers.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == organizerId && o.IsActive)
                ?? throw new KeyNotFoundException("Compte introuvable.");

            if (await IsEmailVerifiedAsync(organizerId))
                throw new InvalidOperationException("Votre adresse e-mail est déjà vérifiée.");

            await SendVerificationEmailAsync(organizer);
        }

        private LoginResponseDto BuildLoginResponse(Utilisateur organizer)
        {
            var (token, expiration) = _jwtService.GenerateOrganizerToken(organizer);
            return new LoginResponseDto
            {
                Token = token,
                Expiration = expiration,
                Utilisateur = ToDto(organizer, true)
            };
        }

        public async Task RequestPasswordResetAsync(DemanderResetPasswordDto dto)
        {
            var user = await _adminContext.Organizers.IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Email == dto.Email && u.IsActive);

            // Ne jamais révéler si l'e-mail existe ou non (anti-énumération) : on
            // sort silencieusement si l'utilisateur est introuvable ou inactif.
            if (user == null)
                return;

            var (token, _) = _jwtService.GeneratePasswordResetToken(user);
            var baseUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";
            var resetLink = $"{baseUrl}/reinitialiser-mot-de-passe?token={Uri.EscapeDataString(token)}";

            var html = EmailLayout.Render(new EmailMessage
            {
                Preheader = "Choisissez un nouveau mot de passe (lien valable 30 minutes).",
                Kicker = "Sécurité du compte",
                Title = "Nouveau mot de passe",
                BodyHtml = EmailLayout.P($"Bonjour {EmailLayout.E(user.FullName)},")
                    + EmailLayout.P("Vous avez demandé la réinitialisation du mot de passe de votre compte TBF MOMENT. "
                        + "Cliquez sur le bouton ci-dessous pour en choisir un nouveau."),
                ButtonText = "Choisir un nouveau mot de passe",
                ButtonUrl = resetLink,
                NoteHtml = "Ce lien est valable 30 minutes et ne fonctionne qu'une fois.<br>"
                    + "Vous n'êtes pas à l'origine de cette demande ? Ignorez cet e-mail : votre mot de passe reste inchangé.",
                FooterReason = "Vous recevez cet e-mail suite à une demande de réinitialisation de mot de passe sur tbfmoment.com.",
            });

            try
            {
                await _emailSender.SendAsync(user.Email, "Réinitialisation de votre mot de passe TBF Moment", html);
            }
            catch
            {
                // Ne jamais laisser un échec d'envoi (SMTP en panne, etc.) se traduire par une
                // réponse différente de celle d'un e-mail inconnu : ça romprait la garantie
                // anti-énumération ci-dessus (un email connu répondrait 500, un inconnu 204).
            }
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            if (!_jwtService.TryValidatePasswordResetToken(dto.Token, out var userId, out var tokenVersion))
                throw new InvalidOperationException("Lien de réinitialisation invalide ou expiré.");

            var user = await _adminContext.Organizers.IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
            if (user == null)
                throw new InvalidOperationException("Lien de réinitialisation invalide ou expiré.");

            if (user.UpdatedAt.ToUnixTimeMilliseconds() != tokenVersion)
                throw new InvalidOperationException("Ce lien de réinitialisation a déjà été utilisé.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTimeOffset.UtcNow;
            await _adminContext.SaveChangesAsync();
        }

        private static bool IsUniqueViolation(DbUpdateException ex)
        {
            return ex.InnerException?.Message.Contains("duplicate key") == true
                || ex.InnerException?.Message.Contains("23505") == true;
        }

        // Hash BCrypt d'une valeur aléatoire, utilisé pour égaliser le temps de réponse
        // du login quand l'e-mail est inconnu.
        private static readonly string DummyPasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N"));

        private static UtilisateurDtos ToDto(Utilisateur utilisateur, bool emailVerified = false) => new()
        {
            EmailVerified = emailVerified,
            Id = utilisateur.Id,
            Email = utilisateur.Email,
            FullName = utilisateur.FullName,
            Phone = utilisateur.Phone,
            IsActive = utilisateur.IsActive,
            CreatedAt = utilisateur.CreatedAt
        };
    }
}