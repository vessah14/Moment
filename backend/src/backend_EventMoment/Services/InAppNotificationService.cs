using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class InAppNotificationService : IInAppNotificationService
    {
        private readonly AdminDbContext _context;
        private readonly ILogger<InAppNotificationService> _logger;

        public InAppNotificationService(AdminDbContext context, ILogger<InAppNotificationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<NotificationFeedDto> GetAsync(Guid organizerId)
        {
            var notifications = _context.OrganizerNotifications
                .AsNoTracking()
                .Where(n => n.OrganizerId == organizerId);
            var unreadCount = await notifications.CountAsync(n => n.ReadAt == null);
            var items = await notifications
                .OrderByDescending(n => n.CreatedAt)
                .Take(100)
                .Select(n => new OrganizerNotificationDto
                {
                    Id = n.Id,
                    EventId = n.EventId,
                    EventName = n.Event.Name,
                    Type = n.Type,
                    Title = n.Title,
                    Message = n.Message,
                    Link = n.Link,
                    CreatedAt = n.CreatedAt,
                    ReadAt = n.ReadAt,
                })
                .ToListAsync();

            return new NotificationFeedDto { Items = items, UnreadCount = unreadCount };
        }

        public async Task<bool> MarkReadAsync(Guid id, Guid organizerId)
        {
            var notification = await _context.OrganizerNotifications
                .FirstOrDefaultAsync(n => n.Id == id && n.OrganizerId == organizerId);
            if (notification == null) return false;
            if (notification.ReadAt == null)
            {
                notification.ReadAt = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync();
            }
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id, Guid organizerId)
        {
            var notification = await _context.OrganizerNotifications
                .FirstOrDefaultAsync(n => n.Id == id && n.OrganizerId == organizerId);
            if (notification == null) return false;
            _context.OrganizerNotifications.Remove(notification);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> MarkAllReadAsync(Guid organizerId)
        {
            var unread = await _context.OrganizerNotifications
                .Where(n => n.OrganizerId == organizerId && n.ReadAt == null)
                .ToListAsync();
            var readAt = DateTimeOffset.UtcNow;
            foreach (var notification in unread)
                notification.ReadAt = readAt;
            if (unread.Count > 0)
                await _context.SaveChangesAsync();
            return unread.Count;
        }

        public Task NotifyGuestbookAsync(Guid eventId, string authorName) =>
            CreateForEventAsync(
                eventId,
                "guestbook",
                "Nouveau message dans le livre d'or",
                $"{DisplayName(authorName)} a laissé un message.",
                "/dashboard/livre-dor");

        public Task NotifyGuestPhotoAsync(Guid eventId, string? uploadedBy) =>
            CreateForEventAsync(
                eventId,
                "guest_photo",
                "Nouvelle photo à valider",
                $"{DisplayName(uploadedBy)} a ajouté une photo à votre galerie.",
                "/dashboard/galerie");

        public Task NotifyRsvpAsync(Guid eventId, string guestName, bool? confirmed, int accompanyingCount)
        {
            var answer = confirmed switch
            {
                true => accompanyingCount > 0 ? $"a confirmé sa présence avec {accompanyingCount} accompagnant(s)" : "a confirmé sa présence",
                false => "a décliné l'invitation",
                null => "a répondu « Peut-être »",
            };
            return CreateForEventAsync(
                eventId,
                "rsvp",
                "Nouvelle réponse RSVP",
                $"{DisplayName(guestName)} {answer}.",
                "/dashboard/participants");
        }

        public Task NotifyGiftReservedAsync(Guid eventId, string giftName, string reservedBy) =>
            CreateForEventAsync(
                eventId,
                "gift_reserved",
                "Un cadeau a été réservé",
                $"{DisplayName(reservedBy)} a réservé « {DisplayName(giftName)} ».",
                "/dashboard/liste-mariage");

        private async Task CreateForEventAsync(Guid eventId, string type, string title, string message, string link)
        {
            try
            {
                var target = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                    .Where(e => e.Id == eventId)
                    .Select(e => new { e.OrganizerId })
                    .FirstOrDefaultAsync();
                if (target == null)
                {
                    _logger.LogWarning("Notification ignorée : événement {EventId} introuvable.", eventId);
                    return;
                }

                _context.OrganizerNotifications.Add(new OrganizerNotification
                {
                    Id = Guid.NewGuid(),
                    OrganizerId = target.OrganizerId,
                    EventId = eventId,
                    Type = type,
                    Title = title,
                    Message = message,
                    Link = link,
                    CreatedAt = DateTimeOffset.UtcNow,
                });
                await _context.SaveChangesAsync();
            }
            catch (Exception exception)
            {
                // L'activité métier est déjà enregistrée; une défaillance de notification ne
                // doit pas faire croire à l'invité que son envoi a échoué.
                _logger.LogError(exception, "Impossible d'enregistrer la notification {Type} pour l'événement {EventId}.", type, eventId);
            }
        }

        private static string DisplayName(string? value)
        {
            var name = string.Join(' ', (value ?? string.Empty).Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
            if (name.Length == 0) return "Un invité";
            return name.Length <= 100 ? name : name[..99].TrimEnd() + "…";
        }
    }
}
