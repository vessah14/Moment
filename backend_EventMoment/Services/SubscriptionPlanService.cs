using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class SubscriptionPlanService : ISubscriptionPlanService
    {
        private readonly AdminDbContext _context;

        public SubscriptionPlanService(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<SubscriptionPlanDto> CreateAsync(CreateSubscriptionPlanDto dto)
        {
            var entity = new SubscriptionPlan
            {
                Id = Guid.NewGuid(),
                Code = dto.Code,
                Label = dto.Label,
                PriceCents = dto.PriceCents,
                Currency = dto.Currency,
                Billing = dto.Billing,
                Features = dto.Features,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.SubscriptionPlans.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<SubscriptionPlanDto> GetByIdAsync(Guid id)
        {
            var entity = await _context.SubscriptionPlans.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
                throw new KeyNotFoundException($"Plan {id} introuvable.");

            return Map(entity);
        }

        public async Task<List<SubscriptionPlanDto>> GetAllAsync()
        {
            var entities = await _context.SubscriptionPlans.AsNoTracking().OrderBy(x => x.Label).ToListAsync();
            return entities.Select(Map).ToList();
        }

        public async Task<SubscriptionPlanDto> UpdateAsync(Guid id, UpdateSubscriptionPlanDto dto)
        {
            var entity = await _context.SubscriptionPlans.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
                throw new KeyNotFoundException($"Plan {id} introuvable.");

            entity.Label = dto.Label;
            entity.PriceCents = dto.PriceCents;
            entity.Billing = dto.Billing;
            entity.Features = dto.Features;
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.SubscriptionPlans.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
                return false;

            _context.SubscriptionPlans.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static SubscriptionPlanDto Map(SubscriptionPlan entity) => new()
        {
            Id = entity.Id,
            Code = entity.Code,
            Label = entity.Label,
            PriceCents = entity.PriceCents,
            Currency = entity.Currency,
            Billing = entity.Billing,
            Features = entity.Features
        };
    }
}
