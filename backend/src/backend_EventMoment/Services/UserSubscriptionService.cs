using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class UserSubscriptionService : IUserSubscriptionService
    {
        private readonly AdminDbContext _context;

        public UserSubscriptionService(AdminDbContext context)
        {
            _context = context;
        }

        // Aucun paiement en ligne n'est branché : un organisateur ne peut activer lui-même
        // qu'un plan gratuit. Sans ce contrôle, n'importe qui obtenait un plan payant
        // gratuitement via l'API, et la console admin le comptait comme un revenu.
        private async Task<SubscriptionPlan> GetSelfServicePlanAsync(Guid planId)
        {
            var plan = await _context.SubscriptionPlans.FirstOrDefaultAsync(x => x.Id == planId && x.IsActive)
                ?? throw new KeyNotFoundException("Plan d’abonnement introuvable.");

            if (plan.PriceCents > 0)
                throw new InvalidOperationException(
                    AdminDbContext.NotchPayEnabled
                        ? "Les offres payantes doivent être réglées via le parcours de paiement Notch Pay."
                        : "Les offres payantes s'activent sur demande depuis votre tableau de bord.");

            return plan;
        }

        // Un seul abonnement en cours à la fois : l'ancien est clôturé.
        private async Task CloseCurrentSubscriptionsAsync(Guid organizerId, Guid? exceptId = null)
        {
            var current = await _context.OrganizerSubscriptions
                .Where(s => s.OrganizerId == organizerId && s.Id != exceptId
                    && (s.Status == SubscriptionStatus.Actif || s.Status == SubscriptionStatus.Essai))
                .ToListAsync();
            foreach (var s in current)
            {
                s.Status = SubscriptionStatus.Annule;
                s.EndsAt = DateTimeOffset.UtcNow;
            }
        }

        public async Task<UserSubscriptionDto> SubscribeAsync(Guid organizerId, Guid planId, SubscribeToPlanDto dto)
        {
            var plan = await GetSelfServicePlanAsync(planId);
            await CloseCurrentSubscriptionsAsync(organizerId);

            var entity = new UserSubscription
            {
                Id = Guid.NewGuid(),
                OrganizerId = organizerId,
                PlanId = plan.Id,
                Status = SubscriptionStatus.Actif,
                StartedAt = DateTimeOffset.UtcNow
            };

            _context.OrganizerSubscriptions.Add(entity);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(entity.Id, organizerId);
        }

        public async Task<UserSubscriptionDto> GetByIdAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.OrganizerSubscriptions
                .AsNoTracking()
                .Include(x => x.Plan)
                .FirstOrDefaultAsync(x => x.Id == id && x.OrganizerId == organizerId);

            if (entity == null)
                throw new KeyNotFoundException($"Abonnement {id} introuvable.");

            return Map(entity);
        }

        public async Task<List<UserSubscriptionDto>> GetAllAsync(Guid organizerId)
        {
            var entities = await _context.OrganizerSubscriptions
                .AsNoTracking()
                .Include(x => x.Plan)
                .Where(x => x.OrganizerId == organizerId)
                .OrderByDescending(x => x.StartedAt)
                .ToListAsync();

            return entities.Select(Map).ToList();
        }

        public async Task<UserSubscriptionDto> ChangePlanAsync(Guid id, ChangePlanDto dto, Guid organizerId)
        {
            var entity = await _context.OrganizerSubscriptions
                .Include(x => x.Plan)
                .FirstOrDefaultAsync(x => x.Id == id && x.OrganizerId == organizerId);

            if (entity == null)
                throw new KeyNotFoundException($"Abonnement {id} introuvable.");

            if (entity.Status is SubscriptionStatus.Annule or SubscriptionStatus.Expire)
                throw new InvalidOperationException("Cet abonnement est terminé : souscrivez un nouvel abonnement.");

            var plan = await GetSelfServicePlanAsync(dto.NewPlanId);
            await CloseCurrentSubscriptionsAsync(organizerId, exceptId: entity.Id);

            entity.PlanId = plan.Id;
            entity.Status = SubscriptionStatus.Actif;
            entity.StartedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            return await GetByIdAsync(id, organizerId);
        }

        public async Task<UserSubscriptionDto> CancelAsync(Guid id, CancelSubscriptionDto dto, Guid organizerId)
        {
            var entity = await _context.OrganizerSubscriptions
                .Include(x => x.Plan)
                .FirstOrDefaultAsync(x => x.Id == id && x.OrganizerId == organizerId);

            if (entity == null)
                throw new KeyNotFoundException($"Abonnement {id} introuvable.");

            entity.Status = SubscriptionStatus.Annule;
            entity.EndsAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            return Map(entity);
        }

        private static UserSubscriptionDto Map(UserSubscription entity) => new()
        {
            Id = entity.Id,
            Status = entity.Status,
            StartedAt = entity.StartedAt,
            EndsAt = entity.EndsAt,
            PlanCode = entity.Plan?.Code ?? string.Empty,
            PlanLabel = entity.Plan?.Label ?? string.Empty,
            PriceCents = entity.Plan?.PriceCents ?? 0,
            Billing = entity.Plan?.Billing ?? PlanBilling.Gratuit
        };
    }
}
