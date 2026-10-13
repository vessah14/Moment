using System.Net;
using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Models;
using backend_EventMoment.Services.Email;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public interface IReviewService
    {
        Task<ReviewDto?> GetMineAsync(Guid organizerId);
        Task<ReviewDto> SaveMineAsync(Guid organizerId, SaveReviewDto dto);
        Task<bool> DeleteMineAsync(Guid organizerId);
        Task<List<PublicReviewDto>> GetPublishedAsync(int limit);
        Task<List<AdminReviewDto>> ListAsync();
        Task<AdminReviewDto> SetStatusAsync(Guid id, PlatformReviewStatus status);
    }

    // Avis des clients (organisateurs) sur TBF Moment : un avis par organisateur, publié sur
    // l'accueil seulement après validation par l'admin. Toute modification le repasse en
    // attente, pour qu'un avis validé ne puisse pas être remplacé par autre chose.
    public class ReviewService : IReviewService
    {
        private readonly AdminDbContext _context;
        private readonly IEmailSender? _email;
        private readonly IConfiguration? _config;
        private readonly ILogger<ReviewService>? _logger;

        public ReviewService(AdminDbContext context, IEmailSender? email = null, IConfiguration? config = null, ILogger<ReviewService>? logger = null)
        {
            _context = context;
            _email = email;
            _config = config;
            _logger = logger;
        }

        public async Task<ReviewDto?> GetMineAsync(Guid organizerId)
        {
            var review = await _context.PlatformReviews.AsNoTracking().FirstOrDefaultAsync(r => r.OrganizerId == organizerId);
            return review == null ? null : Fill(new ReviewDto(), review);
        }

        public async Task<ReviewDto> SaveMineAsync(Guid organizerId, SaveReviewDto dto)
        {
            var comment = dto.Comment.Trim();
            var displayName = dto.DisplayName.Trim();
            if (comment.Length < 10)
                throw new InvalidOperationException("Votre commentaire doit faire au moins 10 caractères.");
            if (displayName.Length == 0)
                throw new InvalidOperationException("Indiquez le nom à afficher.");

            var now = DateTimeOffset.UtcNow;
            var review = await _context.PlatformReviews.FirstOrDefaultAsync(r => r.OrganizerId == organizerId);
            var isNew = review == null;
            if (review == null)
            {
                review = new PlatformReview { Id = Guid.NewGuid(), OrganizerId = organizerId, CreatedAt = now };
                _context.PlatformReviews.Add(review);
            }
            review.Rating = dto.Rating;
            review.Comment = comment;
            review.DisplayName = displayName;
            review.Context = string.IsNullOrWhiteSpace(dto.Context) ? null : dto.Context.Trim();
            review.Status = PlatformReviewStatus.EnAttente;
            review.UpdatedAt = now;
            review.ModeratedAt = null;
            await _context.SaveChangesAsync();

            var adminEmail = _config?["Notifications:AdminEmail"] ?? _config?["Brevo:SenderEmail"];
            if (_email != null && !string.IsNullOrWhiteSpace(adminEmail))
            {
                try
                {
                    var adminUrl = _config?["Frontend:AdminUrl"];
                    var stars = new string('★', review.Rating) + new string('☆', 5 - review.Rating);
                    await _email.SendAsync(adminEmail, $"{(isNew ? "Nouvel avis" : "Avis modifié")} ({review.Rating}/5) · {review.DisplayName}",
                        EmailLayout.Render(new EmailMessage
                        {
                            Preheader = $"{review.DisplayName} a donné {review.Rating}/5 à TBF MOMENT.",
                            Kicker = "Console admin",
                            Title = isNew ? "Nouvel avis client" : "Avis modifié",
                            Subtitle = $"{stars}  {review.Rating}/5",
                            BodyHtml = EmailLayout.P("Un organisateur a laissé un avis sur TBF MOMENT. "
                                + "Il n'apparaîtra sur la page d'accueil qu'une fois publié."),
                            Callout = new EmailCallout($"⭐ {review.Rating}/5", review.DisplayName,
                                $"« {EmailLayout.E(review.Comment)} »"),
                            ButtonText = string.IsNullOrWhiteSpace(adminUrl) ? null : "Modérer l'avis",
                            ButtonUrl = string.IsNullOrWhiteSpace(adminUrl) ? null : $"{adminUrl.TrimEnd('/')}/admin/moderation",
                            SignatureHtml = "<b>TBF MOMENT</b> · notification automatique",
                            FooterReason = "Vous recevez cet e-mail en tant qu'administrateur de TBF MOMENT.",
                        }));
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Notification d'avis non envoyée");
                }
            }
            return Fill(new ReviewDto(), review);
        }

        public async Task<bool> DeleteMineAsync(Guid organizerId)
        {
            var review = await _context.PlatformReviews.FirstOrDefaultAsync(r => r.OrganizerId == organizerId);
            if (review == null)
                return false;
            _context.PlatformReviews.Remove(review);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<PublicReviewDto>> GetPublishedAsync(int limit)
        {
            return await _context.PlatformReviews.AsNoTracking()
                .Where(r => r.Status == PlatformReviewStatus.Publie)
                .OrderByDescending(r => r.Rating).ThenByDescending(r => r.UpdatedAt)
                .Take(Math.Clamp(limit, 1, 12))
                .Select(r => new PublicReviewDto { Rating = r.Rating, Comment = r.Comment, DisplayName = r.DisplayName, Context = r.Context })
                .ToListAsync();
        }

        public async Task<List<AdminReviewDto>> ListAsync()
        {
            var reviews = await _context.PlatformReviews.AsNoTracking()
                .OrderBy(r => r.Status == PlatformReviewStatus.EnAttente ? 0 : 1)
                .ThenByDescending(r => r.UpdatedAt)
                .Take(300)
                .ToListAsync();
            var ids = reviews.Select(r => r.OrganizerId).Distinct().ToList();
            var emails = await _context.Organizers.AsNoTracking().IgnoreQueryFilters()
                .Where(o => ids.Contains(o.Id))
                .ToDictionaryAsync(o => o.Id, o => o.Email);
            return reviews.Select(r =>
            {
                var dto = Fill(new AdminReviewDto(), r);
                dto.OrganizerEmail = emails.GetValueOrDefault(r.OrganizerId) ?? string.Empty;
                return dto;
            }).ToList();
        }

        public async Task<AdminReviewDto> SetStatusAsync(Guid id, PlatformReviewStatus status)
        {
            var review = await _context.PlatformReviews.FirstOrDefaultAsync(r => r.Id == id)
                ?? throw new KeyNotFoundException("Avis introuvable.");
            review.Status = status;
            review.ModeratedAt = status == PlatformReviewStatus.EnAttente ? null : DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            var email = await _context.Organizers.AsNoTracking().IgnoreQueryFilters()
                .Where(o => o.Id == review.OrganizerId).Select(o => o.Email).FirstOrDefaultAsync();
            var dto = Fill(new AdminReviewDto(), review);
            dto.OrganizerEmail = email ?? string.Empty;
            return dto;
        }

        private static T Fill<T>(T dto, PlatformReview r) where T : ReviewDto
        {
            dto.Id = r.Id;
            dto.Rating = r.Rating;
            dto.Comment = r.Comment;
            dto.DisplayName = r.DisplayName;
            dto.Context = r.Context;
            dto.Status = r.Status;
            dto.UpdatedAt = r.UpdatedAt;
            return dto;
        }
    }
}
