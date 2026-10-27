using System.Net;
using System.Text.Json;
using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Models;
using backend_EventMoment.Services.Email;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public interface IPlanService
    {
        Task<PlanUsageDto> GetUsageAsync(Guid organizerId);
        Task EnsureCanCreateEventAsync(Guid organizerId);
        Task EnsureCanAddGuestAsync(Guid organizerId, Guid eventId);
        Task EnsureCanAddPhotoAsync(Guid organizerId, Guid eventId);
        Task<bool> HasFeatureAsync(Guid organizerId, PlanFeature feature);
        Task EnsureFeatureAsync(Guid organizerId, PlanFeature feature);

        Task<UpgradeRequestDto> RequestUpgradeAsync(Guid organizerId, CreateUpgradeRequestDto dto);
        Task<UpgradeRequestDto?> GetLatestRequestAsync(Guid organizerId);
        Task<bool> CancelPendingRequestAsync(Guid organizerId);

        Task<List<AdminUpgradeRequestDto>> ListRequestsAsync();
        Task<AdminUpgradeRequestDto> ApproveAsync(Guid requestId, Guid adminId, string? note);
        Task<AdminUpgradeRequestDto> RejectAsync(Guid requestId, Guid adminId, string? note);
    }

    // Fonctions réservées à certaines offres (clé dans subscription_plans.features).
    public enum PlanFeature
    {
        PremiumTemplates, // modèles premium (thèmes animés)
        Seating,          // plan de table
        Checkin,          // scanner des pass d'entrée
        Ticketing,        // billetterie
        Branding,         // page sans la mention « Créé avec TBF MOMENT »
        AutoReminders,    // rappels automatiques par e-mail
    }

    // Offres et limites. Sans abonnement actif, l'organisateur est sur l'offre « free ».
    // Les limites viennent de subscription_plans.features :
    //   {"maxEvents": 3, "maxGuests": 50, "maxPhotos": 20, "seating": false, …}
    // Nombre absent ou null = illimité ; fonction absente = autorisée (offres créées avant ces
    // clés). Une demande de passage à une offre payante est validée par l'admin ou via KPay.
    public class PlanService : IPlanService
    {
        public const string FreePlanCode = "free";
        // Limites serveur pour Free et Premium, même si la base n'a pas encore été migrée.
        private const int DefaultFreeMaxEvents = 3;
        private const int DefaultPremiumMaxEvents = 5;
        private const int DefaultFreeMaxGuests = 50;
        private const int DefaultFreeMaxPhotos = 20;

        public static string FeatureKey(PlanFeature feature) => feature switch
        {
            PlanFeature.PremiumTemplates => "premiumTemplates",
            PlanFeature.Seating => "seating",
            PlanFeature.Checkin => "checkin",
            PlanFeature.Ticketing => "ticketing",
            PlanFeature.Branding => "branding",
            PlanFeature.AutoReminders => "autoReminders",
            _ => throw new ArgumentOutOfRangeException(nameof(feature)),
        };

        private static string FeatureName(PlanFeature feature) => feature switch
        {
            PlanFeature.PremiumTemplates => "Les modèles premium sont inclus",
            PlanFeature.Seating => "Le plan de table est inclus",
            PlanFeature.Checkin => "Le scanner des pass d'entrée est inclus",
            PlanFeature.Ticketing => "La billetterie est incluse",
            PlanFeature.Branding => "La page sans la mention TBF MOMENT est incluse",
            PlanFeature.AutoReminders => "Les rappels automatiques sont inclus",
            _ => "Cette fonction est incluse",
        };

        private readonly AdminDbContext _context;
        private readonly IEmailSender? _email;
        private readonly IConfiguration? _config;
        private readonly ILogger<PlanService>? _logger;

        public PlanService(AdminDbContext context, IEmailSender? email = null, IConfiguration? config = null, ILogger<PlanService>? logger = null)
        {
            _context = context;
            _email = email;
            _config = config;
            _logger = logger;
        }

        private sealed record PlanLimits(SubscriptionPlan? Plan, string Code, string Label, int PriceCents, int? MaxEvents, int? MaxGuests, DateTimeOffset? EndsAt)
        {
            public int? MaxPhotos { get; init; }
            public IReadOnlyDictionary<string, bool> Features { get; init; } = new Dictionary<string, bool>();
            public bool Has(PlanFeature feature) =>
                feature == PlanFeature.Checkin || !Features.TryGetValue(FeatureKey(feature), out var on) || on;
        }

        private sealed record PlanSettings(int? MaxEvents, int? MaxGuests, int? MaxPhotos, Dictionary<string, bool> Features);

        private static PlanSettings ReadSettings(string? features)
        {
            var flags = new Dictionary<string, bool>();
            try
            {
                using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(features) ? "{}" : features);
                if (doc.RootElement.ValueKind != JsonValueKind.Object)
                    return new PlanSettings(null, null, null, flags);
                int? Read(string name) =>
                    doc.RootElement.TryGetProperty(name, out var v) && v.ValueKind == JsonValueKind.Number && v.TryGetInt32(out var n)
                        ? n
                        : null;
                foreach (var feature in Enum.GetValues<PlanFeature>())
                {
                    var key = FeatureKey(feature);
                    if (doc.RootElement.TryGetProperty(key, out var v) && v.ValueKind is JsonValueKind.True or JsonValueKind.False)
                        flags[key] = v.GetBoolean();
                }
                return new PlanSettings(Read("maxEvents"), Read("maxGuests"), Read("maxPhotos"), flags);
            }
            catch (JsonException)
            {
                return new PlanSettings(null, null, null, flags);
            }
        }

        private async Task<PlanLimits> GetLimitsAsync(Guid organizerId)
        {
            var now = DateTimeOffset.UtcNow;
            // IgnoreQueryFilters : le filtre global suit l'utilisateur connecté (l'admin lors
            // d'une validation) ; on filtre ici explicitement par organisateur.
            var subscription = await _context.OrganizerSubscriptions.AsNoTracking().IgnoreQueryFilters()
                .Include(s => s.Plan)
                .Where(s => s.OrganizerId == organizerId
                    && (s.Status == SubscriptionStatus.Actif || s.Status == SubscriptionStatus.Essai)
                    && (s.EndsAt == null || s.EndsAt > now))
                .OrderByDescending(s => s.StartedAt)
                .FirstOrDefaultAsync();

            var plan = subscription?.Plan
                ?? await _context.SubscriptionPlans.AsNoTracking().FirstOrDefaultAsync(p => p.Code == FreePlanCode);
            if (plan == null)
                return new PlanLimits(null, FreePlanCode, "Free", 0, DefaultFreeMaxEvents, DefaultFreeMaxGuests, null)
                {
                    MaxPhotos = DefaultFreeMaxPhotos,
                    Features = Enum.GetValues<PlanFeature>().ToDictionary(FeatureKey, _ => false),
                };

            var settings = ReadSettings(plan.Features);
            var maxEvents = plan.Code.ToLowerInvariant() switch
            {
                FreePlanCode => DefaultFreeMaxEvents,
                "premium" => DefaultPremiumMaxEvents,
                _ => settings.MaxEvents,
            };
            return new PlanLimits(plan, plan.Code, plan.Label, plan.PriceCents, maxEvents, settings.MaxGuests, subscription?.EndsAt)
            {
                MaxPhotos = settings.MaxPhotos,
                Features = settings.Features,
            };
        }

        // Offre la moins chère qui inclut la fonction, pour le message d'erreur.
        private async Task<string?> CheapestPlanWithAsync(PlanFeature feature)
        {
            var plans = await _context.SubscriptionPlans.AsNoTracking()
                .Where(p => p.IsActive && p.PriceCents > 0)
                .OrderBy(p => p.PriceCents)
                .Select(p => new { p.Label, p.Features })
                .ToListAsync();
            var key = FeatureKey(feature);
            return plans.FirstOrDefault(p => !ReadSettings(p.Features).Features.TryGetValue(key, out var on) || on)?.Label;
        }

        // Événements comptés : tous ceux de l'organisateur sauf les archivés.
        private Task<int> CountEventsAsync(Guid organizerId) =>
            _context.Events.IgnoreQueryFilters()
                .CountAsync(e => e.OrganizerId == organizerId && e.Status != EventStatus.Archive);

        public async Task<PlanUsageDto> GetUsageAsync(Guid organizerId)
        {
            var limits = await GetLimitsAsync(organizerId);
            var pending = await _context.PlanUpgradeRequests.AsNoTracking()
                .Include(r => r.Plan)
                .FirstOrDefaultAsync(r => r.OrganizerId == organizerId && r.Status == UpgradeRequestStatus.EnAttente);
            return new PlanUsageDto
            {
                PlanCode = limits.Code,
                PlanLabel = limits.Label,
                PriceCents = limits.PriceCents,
                MaxEvents = limits.MaxEvents,
                EventsUsed = await CountEventsAsync(organizerId),
                MaxGuests = limits.MaxGuests,
                MaxPhotos = limits.MaxPhotos,
                Features = Enum.GetValues<PlanFeature>().ToDictionary(FeatureKey, limits.Has),
                EndsAt = limits.EndsAt,
                PendingRequest = pending == null ? null : Map(pending),
            };
        }

        public async Task EnsureCanCreateEventAsync(Guid organizerId)
        {
            var limits = await GetLimitsAsync(organizerId);
            if (limits.MaxEvents is int max && await CountEventsAsync(organizerId) >= max)
                throw new InvalidOperationException(
                    $"Votre offre {limits.Label} permet {max} événement{(max > 1 ? "s" : "")}. Archivez un événement ou passez à une offre supérieure.");
        }

        public async Task EnsureCanAddGuestAsync(Guid organizerId, Guid eventId)
        {
            var limits = await GetLimitsAsync(organizerId);
            if (limits.MaxGuests is int max && await _context.Guests.IgnoreQueryFilters().CountAsync(g => g.EventId == eventId) >= max)
                throw new InvalidOperationException(
                    $"Votre offre {limits.Label} permet {max} invités par événement. Passez à une offre supérieure pour en ajouter.");
        }

        public async Task EnsureCanAddPhotoAsync(Guid organizerId, Guid eventId)
        {
            var limits = await GetLimitsAsync(organizerId);
            if (limits.MaxPhotos is int max && await _context.GalleryPhotos.IgnoreQueryFilters().CountAsync(p => p.EventId == eventId) >= max)
                throw new InvalidOperationException(
                    $"Votre offre {limits.Label} permet {max} photos par galerie. Supprimez des photos ou passez à une offre supérieure.");
        }

        public async Task<bool> HasFeatureAsync(Guid organizerId, PlanFeature feature) =>
            (await GetLimitsAsync(organizerId)).Has(feature);

        public async Task EnsureFeatureAsync(Guid organizerId, PlanFeature feature)
        {
            var limits = await GetLimitsAsync(organizerId);
            if (limits.Has(feature))
                return;
            var plan = await CheapestPlanWithAsync(feature);
            throw new InvalidOperationException(plan == null
                ? $"{FeatureName(feature)} dans une offre supérieure à {limits.Label}."
                : $"{FeatureName(feature)} à partir de l'offre {plan}. Votre offre actuelle : {limits.Label}.");
        }

        // ------------------------------------------------------------------ Demandes

        public async Task<UpgradeRequestDto> RequestUpgradeAsync(Guid organizerId, CreateUpgradeRequestDto dto)
        {
            // Offre suivie (pas AsNoTracking) : elle devient la navigation de la demande.
            var plan = await _context.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Id == dto.PlanId && p.IsActive)
                ?? throw new KeyNotFoundException("Offre introuvable.");
            if (plan.PriceCents <= 0)
                throw new InvalidOperationException("Cette offre est gratuite : aucune demande n'est nécessaire.");

            var current = await GetLimitsAsync(organizerId);
            if (current.Code == plan.Code)
                throw new InvalidOperationException($"Vous êtes déjà sur l'offre {plan.Label}.");
            if (await _context.PlanUpgradeRequests.AnyAsync(r => r.OrganizerId == organizerId && r.Status == UpgradeRequestStatus.EnAttente))
                throw new InvalidOperationException("Une demande est déjà en cours de traitement. Annulez-la pour en faire une nouvelle.");

            var request = new PlanUpgradeRequest
            {
                Id = Guid.NewGuid(),
                OrganizerId = organizerId,
                PlanId = plan.Id,
                Status = UpgradeRequestStatus.EnAttente,
                Phone = dto.Phone.Trim(),
                Message = string.IsNullOrWhiteSpace(dto.Message) ? null : dto.Message.Trim(),
                CreatedAt = DateTimeOffset.UtcNow,
            };
            _context.PlanUpgradeRequests.Add(request);
            await _context.SaveChangesAsync();
            request.Plan = plan;

            var organizer = await _context.Organizers.AsNoTracking().IgnoreQueryFilters().FirstOrDefaultAsync(o => o.Id == organizerId);
            var adminEmails = AdminNotificationRecipients.Get(_config);
            if (organizer != null && adminEmails.Count > 0)
            {
                var adminUrl = _config?["Frontend:AdminUrl"];
                var subject = $"Demande d'offre {plan.Label} · {organizer.FullName}";
                var html = EmailLayout.Render(new EmailMessage
                {
                    Preheader = $"{organizer.FullName} demande l'offre {plan.Label}.",
                    Kicker = "Console admin",
                    Title = $"Demande d'offre {plan.Label}",
                    Subtitle = $"{FormatPrice(plan.PriceCents)} par mois",
                    BodyHtml = EmailLayout.P($"<b>{Html(organizer.FullName)}</b> demande à passer à l'offre <b>{Html(plan.Label)}</b>.")
                        + (request.Message == null ? "" : EmailLayout.P($"Message : « {Html(request.Message)} »"))
                        + EmailLayout.P("Une fois le paiement Mobile Money reçu, activez l'offre depuis la console admin (Facturation)."),
                    Callout = new EmailCallout("👤 Organisateur", organizer.FullName,
                        EmailLayout.Lines(("E-mail :", organizer.Email), ("Mobile Money :", request.Phone))),
                    ButtonText = string.IsNullOrWhiteSpace(adminUrl) ? null : "Ouvrir la facturation",
                    ButtonUrl = string.IsNullOrWhiteSpace(adminUrl) ? null : $"{adminUrl.TrimEnd('/')}/admin/facturation",
                    SignatureHtml = "<b>TBF MOMENT</b> · notification automatique",
                    FooterReason = "Vous recevez cet e-mail en tant qu'administrateur de TBF MOMENT.",
                });
                foreach (var adminEmail in adminEmails)
                    await TrySendAsync(adminEmail, subject, html);
            }
            return Map(request);
        }

        public async Task<UpgradeRequestDto?> GetLatestRequestAsync(Guid organizerId)
        {
            var request = await _context.PlanUpgradeRequests.AsNoTracking()
                .Include(r => r.Plan)
                .Where(r => r.OrganizerId == organizerId)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();
            return request == null ? null : Map(request);
        }

        public async Task<bool> CancelPendingRequestAsync(Guid organizerId)
        {
            var request = await _context.PlanUpgradeRequests
                .FirstOrDefaultAsync(r => r.OrganizerId == organizerId && r.Status == UpgradeRequestStatus.EnAttente);
            if (request == null)
                return false;
            request.Status = UpgradeRequestStatus.Annulee;
            request.HandledAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // ------------------------------------------------------------------ Admin

        public async Task<List<AdminUpgradeRequestDto>> ListRequestsAsync()
        {
            var requests = await _context.PlanUpgradeRequests.AsNoTracking()
                .Include(r => r.Plan)
                .OrderBy(r => r.Status == UpgradeRequestStatus.EnAttente ? 0 : 1)
                .ThenByDescending(r => r.CreatedAt)
                .Take(200)
                .ToListAsync();
            var organizerIds = requests.Select(r => r.OrganizerId).Distinct().ToList();
            var organizers = await _context.Organizers.AsNoTracking().IgnoreQueryFilters()
                .Where(o => organizerIds.Contains(o.Id))
                .ToDictionaryAsync(o => o.Id);
            return requests.Select(r => MapAdmin(r, organizers.GetValueOrDefault(r.OrganizerId))).ToList();
        }

        public async Task<AdminUpgradeRequestDto> ApproveAsync(Guid requestId, Guid adminId, string? note)
        {
            var request = await LoadPendingAsync(requestId);
            var now = DateTimeOffset.UtcNow;

            // Un seul abonnement en cours : l'ancien est clôturé, le nouveau court un mois
            // (ou un an pour une offre annuelle) à partir de la validation.
            var current = await _context.OrganizerSubscriptions.IgnoreQueryFilters()
                .Where(s => s.OrganizerId == request.OrganizerId && (s.Status == SubscriptionStatus.Actif || s.Status == SubscriptionStatus.Essai))
                .ToListAsync();
            foreach (var s in current)
            {
                s.Status = SubscriptionStatus.Annule;
                s.EndsAt = now;
            }
            _context.OrganizerSubscriptions.Add(new UserSubscription
            {
                Id = Guid.NewGuid(),
                OrganizerId = request.OrganizerId,
                PlanId = request.PlanId,
                Status = SubscriptionStatus.Actif,
                StartedAt = now,
                EndsAt = request.Plan.Billing == PlanBilling.Annuel ? now.AddYears(1) : now.AddMonths(1),
            });

            request.Status = UpgradeRequestStatus.Approuvee;
            request.AdminNote = Clean(note);
            request.HandledAt = now;
            request.HandledBy = adminId;
            await _context.SaveChangesAsync();

            var until = now.AddMonths(request.Plan.Billing == PlanBilling.Annuel ? 12 : 1);
            var organizer = await NotifyOrganizerAsync(request,
                $"Votre offre {request.Plan.Label} est activée",
                name => new EmailMessage
                {
                    Preheader = $"Votre offre {request.Plan.Label} est active : profitez-en !",
                    Kicker = "Offre activée",
                    Title = $"Bienvenue en {request.Plan.Label} ! 🚀",
                    Subtitle = "Merci pour votre confiance.",
                    BodyHtml = EmailLayout.P($"Bonjour {Html(name)},")
                        + EmailLayout.P($"Bonne nouvelle : votre offre <b>{Html(request.Plan.Label)}</b> est activée. "
                            + "Toutes ses fonctionnalités sont disponibles dès maintenant dans votre tableau de bord."),
                    Callout = new EmailCallout("🎁 Votre offre", request.Plan.Label,
                        EmailLayout.Lines(("Active jusqu'au :", until.ToString("dd/MM/yyyy")))),
                    ButtonText = "Ouvrir mon tableau de bord",
                    ButtonUrl = $"{FrontendUrl}/dashboard",
                    FooterReason = "Vous recevez cet e-mail suite à votre demande d'offre sur tbfmoment.com.",
                });
            return MapAdmin(request, organizer);
        }

        public async Task<AdminUpgradeRequestDto> RejectAsync(Guid requestId, Guid adminId, string? note)
        {
            var request = await LoadPendingAsync(requestId);
            request.Status = UpgradeRequestStatus.Refusee;
            request.AdminNote = Clean(note);
            request.HandledAt = DateTimeOffset.UtcNow;
            request.HandledBy = adminId;
            await _context.SaveChangesAsync();

            var organizer = await NotifyOrganizerAsync(request,
                $"Votre demande d'offre {request.Plan.Label}",
                name => new EmailMessage
                {
                    Preheader = $"Votre demande d'offre {request.Plan.Label} n'a pas pu être validée.",
                    Kicker = "Votre demande d'offre",
                    Title = "Demande non validée",
                    Subtitle = $"Offre {request.Plan.Label}",
                    BodyHtml = EmailLayout.P($"Bonjour {Html(name)},")
                        + EmailLayout.P($"Votre demande de passage à l'offre <b>{Html(request.Plan.Label)}</b> n'a pas pu être validée.")
                        + (request.AdminNote == null ? "" : EmailLayout.P($"<b>Motif :</b> {Html(request.AdminNote)}"))
                        + EmailLayout.P("Vous pouvez faire une nouvelle demande depuis votre tableau de bord, "
                            + "ou simplement répondre à cet e-mail si vous avez une question."),
                    ButtonText = "Ouvrir mon tableau de bord",
                    ButtonUrl = $"{FrontendUrl}/dashboard",
                    FooterReason = "Vous recevez cet e-mail suite à votre demande d'offre sur tbfmoment.com.",
                });
            return MapAdmin(request, organizer);
        }

        private async Task<PlanUpgradeRequest> LoadPendingAsync(Guid requestId)
        {
            var request = await _context.PlanUpgradeRequests.Include(r => r.Plan).FirstOrDefaultAsync(r => r.Id == requestId)
                ?? throw new KeyNotFoundException("Demande introuvable.");
            if (request.Status != UpgradeRequestStatus.EnAttente)
                throw new InvalidOperationException("Cette demande a déjà été traitée.");
            return request;
        }

        private string FrontendUrl => (_config?["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');

        private async Task<Utilisateur?> NotifyOrganizerAsync(PlanUpgradeRequest request, string subject, Func<string, EmailMessage> message)
        {
            var organizer = await _context.Organizers.AsNoTracking().IgnoreQueryFilters().FirstOrDefaultAsync(o => o.Id == request.OrganizerId);
            if (organizer != null)
                await TrySendAsync(organizer.Email, subject, EmailLayout.Render(message(organizer.FullName)));
            return organizer;
        }

        private async Task TrySendAsync(string to, string subject, string html)
        {
            if (_email == null)
                return;
            try
            {
                await _email.SendAsync(to, subject, html);
            }
            catch (Exception ex)
            {
                // La demande est enregistrée : un e-mail en échec ne doit pas l'annuler.
                _logger?.LogWarning(ex, "Notification d'offre non envoyée à {To}", to);
            }
        }

        private static string Html(string value) => WebUtility.HtmlEncode(value);
        private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        private static string FormatPrice(int cents) => $"{cents / 100:N0} FCFA".Replace(',', ' ');

        private static UpgradeRequestDto Map(PlanUpgradeRequest r) => Fill(new UpgradeRequestDto(), r);

        private static AdminUpgradeRequestDto MapAdmin(PlanUpgradeRequest r, Utilisateur? organizer)
        {
            var dto = Fill(new AdminUpgradeRequestDto(), r);
            dto.OrganizerId = r.OrganizerId;
            dto.OrganizerName = organizer?.FullName ?? "Compte supprimé";
            dto.OrganizerEmail = organizer?.Email ?? string.Empty;
            return dto;
        }

        private static T Fill<T>(T dto, PlanUpgradeRequest r) where T : UpgradeRequestDto
        {
            dto.Id = r.Id;
            dto.PlanId = r.PlanId;
            dto.PlanLabel = r.Plan?.Label ?? string.Empty;
            dto.PriceCents = r.Plan?.PriceCents ?? 0;
            dto.Status = r.Status;
            dto.Phone = r.Phone;
            dto.Message = r.Message;
            dto.AdminNote = r.AdminNote;
            dto.CreatedAt = r.CreatedAt;
            dto.HandledAt = r.HandledAt;
            return dto;
        }
    }
}
