using backend_EventMoment.Data;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class GuestService : IGuestService
    {
        private readonly AdminDbContext _context;
        private readonly IOrganizerNotifier? _notifier;
        private readonly IPlanService? _plans;

        public GuestService(AdminDbContext context, IOrganizerNotifier? notifier = null, IPlanService? plans = null)
        {
            _context = context;
            _notifier = notifier;
            _plans = plans;
        }

        public async Task<GuestDTO> CreateAsync(CreateGuestDto dto, Guid eventId, Guid organizerId, Guid? groupId = null)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            if (groupId.HasValue && !await _context.GuestGroups.AnyAsync(g => g.Id == groupId.Value && g.EventId == eventId))
                throw new KeyNotFoundException("Groupe introuvable pour cet événement.");

            await EnsureEmailNotUsedAsync(eventId, dto.Email, exceptGuestId: null);
            // Nombre d'invités par événement limité par l'offre (Free : 50, Premium : 500…).
            if (_plans != null)
                await _plans.EnsureCanAddGuestAsync(organizerId, eventId);

            var entity = new Guest
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                GroupId = groupId,
                FullName = dto.FullName,
                Phone = dto.Phone,
                Email = dto.Email ?? string.Empty,
                Status = GuestStatus.EnAttente,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Guests.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity, null);
        }

        // Un même e-mail invité deux fois au même événement reçoit tout en double
        // (invitations, rappels, campagnes) et fausse les compteurs.
        private async Task EnsureEmailNotUsedAsync(Guid eventId, string? email, Guid? exceptGuestId)
        {
            if (string.IsNullOrWhiteSpace(email))
                return;

            var normalized = email.Trim().ToLower();
            if (await _context.Guests.AnyAsync(g => g.EventId == eventId
                    && g.Email != null && g.Email.ToLower() == normalized
                    && (exceptGuestId == null || g.Id != exceptGuestId)))
                throw new InvalidOperationException($"Un invité avec l'adresse {email.Trim()} existe déjà pour cet événement.");
        }

        private async Task<Dictionary<Guid, DateTimeOffset>> CheckinsForAsync(IEnumerable<Guid> guestIds)
        {
            var ids = guestIds.ToList();
            return await _context.GuestCheckins.AsNoTracking()
                .Where(c => ids.Contains(c.GuestId))
                .ToDictionaryAsync(c => c.GuestId, c => c.CheckedInAt);
        }

        public async Task<GuestDTO> CheckInAsync(Guid id, Guid organizerId)
        {
            var guest = await _context.Guests.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId)
                ?? throw new KeyNotFoundException($"Invité {id} introuvable.");

            var existing = await _context.GuestCheckins.AsNoTracking().FirstOrDefaultAsync(c => c.GuestId == id);
            if (existing != null)
                return Map(guest, existing.CheckedInAt);

            var checkin = new GuestCheckin { GuestId = id, EventId = guest.EventId, CheckedInAt = DateTimeOffset.UtcNow };
            _context.GuestCheckins.Add(checkin);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Deux appareils ont scanné le même invité au même instant : déjà pointé.
                _context.Entry(checkin).State = EntityState.Detached;
                var saved = await _context.GuestCheckins.AsNoTracking().FirstAsync(c => c.GuestId == id);
                return Map(guest, saved.CheckedInAt);
            }
            return Map(guest, checkin.CheckedInAt);
        }

        public async Task<GuestDTO> UndoCheckInAsync(Guid id, Guid organizerId)
        {
            var guest = await _context.Guests.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId)
                ?? throw new KeyNotFoundException($"Invité {id} introuvable.");

            var existing = await _context.GuestCheckins.FirstOrDefaultAsync(c => c.GuestId == id);
            if (existing != null)
            {
                _context.GuestCheckins.Remove(existing);
                await _context.SaveChangesAsync();
            }
            return Map(guest, null);
        }

        public async Task<GuestDTO> GetByIdAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.Guests.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Invité {id} introuvable.");

            var checkins = await CheckinsForAsync(new[] { entity.Id });
            return Map(entity, checkins.TryGetValue(entity.Id, out var at) ? at : null);
        }

        public async Task<List<GuestDTO>> GetAllAsync(Guid organizerId, Guid? eventId = null)
        {
            var query = _context.Guests.AsNoTracking().Where(g => g.Event.OrganizerId == organizerId);
            if (eventId.HasValue)
                query = query.Where(g => g.EventId == eventId.Value);

            var entities = await query.OrderBy(g => g.FullName).ToListAsync();
            var checkins = await CheckinsForAsync(entities.Select(g => g.Id));
            return entities.Select(g => Map(g, checkins.TryGetValue(g.Id, out var at) ? at : null)).ToList();
        }

        public async Task<GuestDTO> UpdateAsync(Guid id, UpdateGuestDto dto, Guid organizerId)
        {
            var entity = await _context.Guests.FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Invité {id} introuvable.");

            if (dto.GroupId.HasValue && !await _context.GuestGroups.AnyAsync(g => g.Id == dto.GroupId.Value && g.EventId == entity.EventId))
                throw new KeyNotFoundException("Groupe introuvable pour cet événement.");

            await EnsureEmailNotUsedAsync(entity.EventId, dto.Email, exceptGuestId: entity.Id);

            entity.GroupId = dto.GroupId;
            entity.FullName = dto.FullName;
            entity.Phone = dto.Phone;
            entity.Email = dto.Email ?? string.Empty;
            entity.Status = dto.Status;
            entity.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            var checkins = await CheckinsForAsync(new[] { entity.Id });
            return Map(entity, checkins.TryGetValue(entity.Id, out var at) ? at : null);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.Guests.FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                return false;

            _context.Guests.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PublicInvitationDto?> GetPublicInvitationAsync(Guid guestId)
        {
            var guest = await _context.Guests.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(g => g.Id == guestId);
            if (guest == null) return null;

            var eventEntity = await _context.Events.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == guest.EventId && e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id));
            if (eventEntity == null) return null;

            var location = await _context.EventLocations.IgnoreQueryFilters().AsNoTracking()
                .Where(l => l.EventId == guest.EventId)
                .OrderBy(l => l.Position)
                .FirstOrDefaultAsync();

            var rsvp = await _context.RsvpResponses.IgnoreQueryFilters().AsNoTracking()
                .Where(r => r.GuestId == guestId)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();

            return MapInvitation(guest, eventEntity, location, rsvp);
        }

        public async Task<PublicInvitationDto?> SubmitPublicRsvpAsync(Guid guestId, SubmitPublicRsvpDto dto)
        {
            var guest = await _context.Guests.IgnoreQueryFilters()
                .FirstOrDefaultAsync(g => g.Id == guestId);
            if (guest == null) return null;

            var eventEntity = await _context.Events.IgnoreQueryFilters()
                .FirstOrDefaultAsync(e => e.Id == guest.EventId && e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id));
            if (eventEntity == null) return null;

            if (IsRsvpClosed(eventEntity))
                throw new InvalidOperationException("Les réponses sont closes : l'événement a déjà eu lieu.");

            guest.Status = dto.Confirmed ? GuestStatus.Present : GuestStatus.Absent;
            guest.UpdatedAt = DateTimeOffset.UtcNow;

            var rsvp = await _context.RsvpResponses.IgnoreQueryFilters()
                .Where(r => r.GuestId == guestId)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();

            if (rsvp == null)
            {
                rsvp = new RsvpResponse
                {
                    Id = Guid.NewGuid(),
                    GuestId = guestId,
                    EventId = guest.EventId,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                _context.RsvpResponses.Add(rsvp);
            }

            rsvp.Confirmed = dto.Confirmed;
            rsvp.AccompanyingCount = dto.AccompanyingCount;
            rsvp.Message = dto.Message;
            rsvp.RespondedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            if (_notifier != null)
                await _notifier.NotifyNewRsvpAsync(guest.EventId, guest.FullName, dto.Confirmed, dto.AccompanyingCount);

            var location = await _context.EventLocations.IgnoreQueryFilters().AsNoTracking()
                .Where(l => l.EventId == guest.EventId)
                .OrderBy(l => l.Position)
                .FirstOrDefaultAsync();

            return MapInvitation(guest, eventEntity, location, rsvp);
        }

        private static PublicInvitationDto MapInvitation(Guest guest, Event eventEntity, Event_Location? location, RsvpResponse? rsvp) => new()
        {
            GuestId = guest.Id,
            GuestFullName = guest.FullName,
            EventName = eventEntity.Name,
            EventSlug = eventEntity.Slug,
            EventDate = eventEntity.EventDate,
            EventStartTime = eventEntity.StartTime,
            ThemeColor = eventEntity.ThemeColor,
            Template = ReadTemplate(eventEntity.CustomFields),
            LocationLabel = location?.Label,
            LocationAddress = location?.Address,
            RsvpConfirmed = rsvp?.Confirmed,
            RsvpAccompanyingCount = rsvp?.AccompanyingCount ?? 0,
            RsvpMessage = rsvp?.Message,
            RsvpClosed = IsRsvpClosed(eventEntity),
        };

        // Modèle de site choisi dans l'assistant (rangé dans CustomFields) : l'invitation
        // reprend ses couleurs. Donnée mal formée → pas de modèle.
        private static string? ReadTemplate(string customFields)
        {
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(customFields);
                return doc.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object
                    && doc.RootElement.TryGetProperty("template", out var tpl)
                    && tpl.ValueKind == System.Text.Json.JsonValueKind.String
                    ? tpl.GetString()
                    : null;
            }
            catch (System.Text.Json.JsonException)
            {
                return null;
            }
        }

        // On peut répondre jusqu'au jour de l'événement inclus.
        private static bool IsRsvpClosed(Event eventEntity) =>
            eventEntity.EventDate.HasValue && eventEntity.EventDate.Value < DateOnly.FromDateTime(DateTime.UtcNow);

        private static GuestDTO Map(Guest entity, DateTimeOffset? checkedInAt) => new()
        {
            CheckedInAt = checkedInAt,
            Id = entity.Id,
            FullName = entity.FullName,
            Phone = entity.Phone ?? string.Empty,
            Email = entity.Email ?? string.Empty,
            GroupId = entity.GroupId,
            Status = entity.Status
        };
    }
}
