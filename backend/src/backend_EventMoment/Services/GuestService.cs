using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
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
        private readonly InvitationSignal? _invitations;

        public GuestService(AdminDbContext context, IOrganizerNotifier? notifier = null, IPlanService? plans = null, InvitationSignal? invitations = null)
        {
            _context = context;
            _notifier = notifier;
            _plans = plans;
            _invitations = invitations;
        }

        public async Task<GuestDTO> CreateAsync(CreateGuestDto dto, Guid eventId, Guid organizerId, Guid? groupId = null)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            if (groupId.HasValue && !await _context.GuestGroups.AnyAsync(g => g.Id == groupId.Value && g.EventId == eventId))
                throw new KeyNotFoundException("Groupe introuvable pour cet événement.");

            await EnsureEmailNotUsedAsync(eventId, dto.Email, exceptGuestId: null);
            await using var transaction = await OrganizerLock.BeginAsync(_context, organizerId);
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
                Seats = dto.Seats,
                Status = GuestStatus.EnAttente,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Guests.Add(entity);
            // Lien d'invitation envoyé par InvitationDispatcher dès que l'événement est publié.
            if (dto.SendInvitation && !string.IsNullOrWhiteSpace(entity.Email))
                _context.GuestInvitations.Add(new GuestInvitation { GuestId = entity.Id, EventId = eventId, QueuedAt = DateTimeOffset.UtcNow });
            await _context.SaveChangesAsync();
            if (transaction != null)
                await transaction.CommitAsync();
            _invitations?.Notify();
            return await WithInvitationAsync(Map(entity, null));
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
            {
                var already = await WithInvitationAsync(Map(guest, existing.CheckedInAt));
                already.AlreadyCheckedIn = true;
                return already;
            }

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
                var already = await WithInvitationAsync(Map(guest, saved.CheckedInAt));
                already.AlreadyCheckedIn = true;
                return already;
            }
            return await WithInvitationAsync(Map(guest, checkin.CheckedInAt));
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
            return await WithInvitationAsync(Map(guest, null));
        }

        public async Task<GuestDTO> GetByIdAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.Guests.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Invité {id} introuvable.");

            var checkins = await CheckinsForAsync(new[] { entity.Id });
            return await WithInvitationAsync(Map(entity, checkins.TryGetValue(entity.Id, out var at) ? at : null));
        }

        public async Task<List<GuestDTO>> GetAllAsync(Guid organizerId, Guid? eventId = null)
        {
            var query = _context.Guests.AsNoTracking().Where(g => g.Event.OrganizerId == organizerId);
            if (eventId.HasValue)
                query = query.Where(g => g.EventId == eventId.Value);

            var entities = await query.OrderBy(g => g.FullName).ToListAsync();
            var checkins = await CheckinsForAsync(entities.Select(g => g.Id));
            return await WithInvitationsAsync(entities.Select(g => Map(g, checkins.TryGetValue(g.Id, out var at) ? at : null)).ToList());
        }

        public async Task<List<GuestEventStatsDto>> GetEventStatsAsync(Guid organizerId, Guid? eventId = null)
        {
            var query = _context.Guests.AsNoTracking()
                .Where(g => g.Event.OrganizerId == organizerId);
            if (eventId.HasValue)
                query = query.Where(g => g.EventId == eventId.Value);

            return await query
                .GroupBy(g => g.EventId)
                .Select(group => new GuestEventStatsDto
                {
                    EventId = group.Key,
                    TotalCount = group.Count(),
                    ConfirmedCount = group.Count(g => g.Status == GuestStatus.Present),
                    PendingCount = group.Count(g => g.Status == GuestStatus.EnAttente),
                    DeclinedCount = group.Count(g => g.Status == GuestStatus.Absent)
                })
                .ToListAsync();
        }

        public async Task<GuestDTO> UpdateAsync(Guid id, UpdateGuestDto dto, Guid organizerId)
        {
            var entity = await _context.Guests.FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId);
            if (entity == null)
                throw new KeyNotFoundException($"Invité {id} introuvable.");

            if (dto.GroupId.HasValue && !await _context.GuestGroups.AnyAsync(g => g.Id == dto.GroupId.Value && g.EventId == entity.EventId))
                throw new KeyNotFoundException("Groupe introuvable pour cet événement.");

            await EnsureEmailNotUsedAsync(entity.EventId, dto.Email, exceptGuestId: entity.Id);

            // Nouvelle adresse : l'invitation déjà envoyée est partie à l'ancienne, on la renvoie.
            var emailChanged = !string.Equals(entity.Email?.Trim(), dto.Email?.Trim(), StringComparison.OrdinalIgnoreCase);
            if (emailChanged && !string.IsNullOrWhiteSpace(dto.Email))
            {
                var invitation = await _context.GuestInvitations.FirstOrDefaultAsync(i => i.GuestId == entity.Id);
                if (invitation != null)
                {
                    invitation.SentAt = null;
                    invitation.Attempts = 0;
                    invitation.LastError = null;
                    invitation.QueuedAt = DateTimeOffset.UtcNow;
                }
            }

            entity.GroupId = dto.GroupId;
            entity.FullName = dto.FullName;
            entity.Phone = dto.Phone;
            entity.Email = dto.Email ?? string.Empty;
            entity.Seats = dto.Seats;
            entity.Status = dto.Status;
            entity.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            if (emailChanged) _invitations?.Notify();
            var checkins = await CheckinsForAsync(new[] { entity.Id });
            return await WithInvitationAsync(Map(entity, checkins.TryGetValue(entity.Id, out var at) ? at : null));
        }

        // Met (ou remet) en file le lien d'invitation d'un invité : envoi ou renvoi manuel.
        public async Task<GuestDTO> QueueInvitationAsync(Guid id, Guid organizerId)
        {
            var guest = await _context.Guests.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId)
                ?? throw new KeyNotFoundException($"Invité {id} introuvable.");
            if (string.IsNullOrWhiteSpace(guest.Email))
                throw new InvalidOperationException("Cet invité n'a pas d'adresse e-mail.");
            await EmailVerificationGuard.EnsureAsync(_context, organizerId);

            var invitation = await _context.GuestInvitations.FirstOrDefaultAsync(i => i.GuestId == id);
            if (invitation == null)
            {
                invitation = new GuestInvitation { GuestId = id, EventId = guest.EventId };
                _context.GuestInvitations.Add(invitation);
            }
            else if (invitation.SentAt != null && invitation.SentAt > DateTimeOffset.UtcNow.AddMinutes(-2))
            {
                throw new InvalidOperationException("L'invitation vient d'être envoyée. Patientez quelques minutes avant de la renvoyer.");
            }
            invitation.SentAt = null;
            invitation.Attempts = 0;
            invitation.LastError = null;
            invitation.QueuedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            _invitations?.Notify();

            var checkins = await CheckinsForAsync(new[] { id });
            return await WithInvitationAsync(Map(guest, checkins.TryGetValue(id, out var at) ? at : null));
        }

        // Envoie le lien à tous les invités de l'événement qui ne l'ont jamais reçu.
        public async Task<int> QueuePendingInvitationsAsync(Guid eventId, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");
            await EmailVerificationGuard.EnsureAsync(_context, organizerId);

            var guests = await _context.Guests.AsNoTracking()
                .Where(g => g.EventId == eventId && g.Email != null && g.Email != ""
                    && !_context.GuestInvitations.Any(i => i.GuestId == g.Id && i.SentAt != null))
                .Select(g => g.Id)
                .ToListAsync();
            var existing = await _context.GuestInvitations.Where(i => guests.Contains(i.GuestId)).ToListAsync();
            var now = DateTimeOffset.UtcNow;
            foreach (var guestId in guests)
            {
                var invitation = existing.FirstOrDefault(i => i.GuestId == guestId);
                if (invitation == null)
                    _context.GuestInvitations.Add(new GuestInvitation { GuestId = guestId, EventId = eventId, QueuedAt = now });
                else
                {
                    invitation.Attempts = 0;
                    invitation.LastError = null;
                    invitation.QueuedAt = now;
                }
            }
            await _context.SaveChangesAsync();
            _invitations?.Notify();
            return guests.Count;
        }

        // Import d'une liste : une ligne par invité (nom, service, téléphone). Les doublons
        // (même téléphone, ou même nom quand il n'y a pas de téléphone) sont ignorés, dans la
        // liste comme dans l'événement ; chaque service devient un groupe d'invités.
        public async Task<ImportGuestsResultDto> ImportAsync(Guid eventId, ImportGuestsDto dto, Guid organizerId)
        {
            if (!await _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var existing = await _context.Guests.AsNoTracking()
                .Where(g => g.EventId == eventId)
                .Select(g => new { g.FullName, g.Phone })
                .ToListAsync();
            var phones = existing.Select(g => PhoneKey(g.Phone)).OfType<string>().ToHashSet();
            var names = existing.Select(g => NameKey(g.FullName)).ToHashSet();
            var groups = (await _context.GuestGroups.Where(g => g.EventId == eventId).ToListAsync())
                .GroupBy(g => NameKey(g.Label))
                .ToDictionary(g => g.Key, g => g.First());

            var result = new ImportGuestsResultDto();
            var batchId = Guid.NewGuid();
            await using var transaction = await OrganizerLock.BeginAsync(_context, organizerId);
            foreach (var row in dto.Rows)
            {
                var fullName = row.FullName?.Trim() ?? string.Empty;
                var phone = string.IsNullOrWhiteSpace(row.Phone) ? null : row.Phone.Trim();
                var phoneKey = PhoneKey(phone);
                if (fullName.Length == 0
                    || (phoneKey != null ? phones.Contains(phoneKey) : names.Contains(NameKey(fullName))))
                {
                    result.Skipped++;
                    continue;
                }

                if (_plans != null)
                {
                    try
                    {
                        await _plans.EnsureCanAddGuestAsync(organizerId, eventId);
                    }
                    catch (InvalidOperationException limit)
                    {
                        result.LimitReached = limit.Message;
                        break;
                    }
                }

                Guid? groupId = null;
                var service = row.Service?.Trim();
                if (!string.IsNullOrEmpty(service))
                {
                    if (!groups.TryGetValue(NameKey(service), out var group))
                    {
                        group = new Guest_group { Id = Guid.NewGuid(), EventId = eventId, Label = service, CreatedAt = DateTimeOffset.UtcNow };
                        _context.GuestGroups.Add(group);
                        groups[NameKey(service)] = group;
                        result.Groups++;
                    }
                    groupId = group.Id;
                }

                var now = DateTimeOffset.UtcNow;
                _context.Guests.Add(new Guest
                {
                    Id = Guid.NewGuid(),
                    EventId = eventId,
                    GroupId = groupId,
                    FullName = fullName,
                    Phone = phone,
                    Email = string.Empty,
                    Status = GuestStatus.EnAttente,
                    ImportBatchId = batchId,
                    CreatedAt = now,
                    UpdatedAt = now
                });
                // Enregistré ligne par ligne : la limite de l'offre compte les invités en base.
                await _context.SaveChangesAsync();
                if (phoneKey != null) phones.Add(phoneKey);
                names.Add(NameKey(fullName));
                result.Added++;
            }
            if (transaction != null)
                await transaction.CommitAsync();
            return result;
        }

        private static string NameKey(string? name) =>
            string.Join(' ', (name ?? string.Empty).Trim().ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries));

        public async Task<GuestDTO> MarkSharedAsync(Guid id, Guid organizerId)
        {
            var guest = await _context.Guests.FirstOrDefaultAsync(x => x.Id == id && x.Event.OrganizerId == organizerId)
                ?? throw new KeyNotFoundException($"Invité {id} introuvable.");
            guest.InvitationSharedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            var checkins = await CheckinsForAsync(new[] { id });
            return await WithInvitationAsync(Map(guest, checkins.TryGetValue(id, out var at) ? at : null));
        }

        private async Task<GuestDTO> WithInvitationAsync(GuestDTO dto) => (await WithInvitationsAsync(new List<GuestDTO> { dto }))[0];

        private async Task<List<GuestDTO>> WithInvitationsAsync(List<GuestDTO> dtos)
        {
            var ids = dtos.Select(d => d.Id).ToList();
            var invitations = await _context.GuestInvitations.AsNoTracking()
                .Where(i => ids.Contains(i.GuestId))
                .ToDictionaryAsync(i => i.GuestId);
            // Dernière réponse de chaque invité : service (choix « côté ») et cocktail.
            var answers = (await _context.RsvpResponses.AsNoTracking()
                    .Where(r => ids.Contains(r.GuestId))
                    .Select(r => new { r.GuestId, r.Side, r.Extra, r.CreatedAt })
                    .ToListAsync())
                .GroupBy(r => r.GuestId)
                .ToDictionary(g => g.Key, g => g.OrderByDescending(r => r.CreatedAt).First());
            foreach (var dto in dtos)
            {
                if (answers.TryGetValue(dto.Id, out var answer))
                {
                    dto.Side = answer.Side;
                    dto.Extra = answer.Extra;
                }
                if (!invitations.TryGetValue(dto.Id, out var inv)) continue;
                dto.InvitationSentAt = inv.SentAt;
                dto.InvitationPending = inv.SentAt == null && inv.Attempts < InvitationDispatcher.MaxAttempts;
                dto.InvitationError = inv.SentAt == null ? inv.LastError : null;
            }
            return dtos;
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

            // Première entrée scannée : le billet de l'invité affiche alors le tampon « Entré ».
            var checkedInAt = await _context.GuestCheckins.IgnoreQueryFilters().AsNoTracking()
                .Where(c => c.GuestId == guestId)
                .OrderBy(c => c.CheckedInAt)
                .Select(c => (DateTimeOffset?)c.CheckedInAt)
                .FirstOrDefaultAsync();

            // Première ouverture du lien personnel : statut « Vue » dans l'espace organisateur.
            if (guest.InvitationOpenedAt == null)
            {
                var tracked = await _context.Guests.IgnoreQueryFilters().FirstAsync(g => g.Id == guestId);
                tracked.InvitationOpenedAt = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync();
            }

            var rules = RsvpRules.Read(await RsvpBlockContentAsync(guest.EventId)).ForSeats(guest.Seats);
            var invitation = MapInvitation(guest, eventEntity, location, rsvp, rules, checkedInAt);
            invitation.DisplayTitle = await HeroTitleAsync(guest.EventId);
            return invitation;
        }

        private Task<string?> HeroBlockContentAsync(Guid eventId) =>
            _context.EventBlocks.IgnoreQueryFilters().AsNoTracking()
                .Where(b => b.EventId == eventId && b.BlockType == "Hero")
                .Select(b => b.Content)
                .FirstOrDefaultAsync();

        private async Task<string?> HeroTitleAsync(Guid eventId)
        {
            var content = await HeroBlockContentAsync(eventId);
            if (string.IsNullOrWhiteSpace(content)) return null;

            try
            {
                using var document = System.Text.Json.JsonDocument.Parse(content);
                return document.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object
                    && document.RootElement.TryGetProperty("title", out var title)
                    && title.ValueKind == System.Text.Json.JsonValueKind.String
                    ? title.GetString()
                    : null;
            }
            catch (System.Text.Json.JsonException)
            {
                return null;
            }
        }

        // Contenu du bloc RSVP : choix « côté », date limite, accompagnants, « Peut-être ».
        private Task<string?> RsvpBlockContentAsync(Guid eventId) =>
            _context.EventBlocks.IgnoreQueryFilters().AsNoTracking()
                .Where(b => b.EventId == eventId && (b.BlockType == "RSVP" || b.BlockType == "Rsvp"))
                .Select(b => b.Content)
                .FirstOrDefaultAsync();

        private static DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);

        public async Task<PublicInvitationDto?> SubmitPublicRsvpAsync(Guid guestId, SubmitPublicRsvpDto dto)
        {
            var guest = await _context.Guests.IgnoreQueryFilters()
                .FirstOrDefaultAsync(g => g.Id == guestId);
            if (guest == null) return null;

            var eventEntity = await _context.Events.IgnoreQueryFilters()
                .FirstOrDefaultAsync(e => e.Id == guest.EventId && e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id));
            if (eventEntity == null) return null;

            var rsvpBlock = await RsvpBlockContentAsync(guest.EventId);
            var rules = RsvpRules.Read(rsvpBlock).ForSeats(guest.Seats);
            EnsureOpen(rules, eventEntity);
            // « Peut-être » : réponse enregistrée, présence ni confirmée ni déclinée.
            var confirmed = dto.Confirmed && !dto.Maybe;
            rules.Validate(confirmed, dto.Maybe, dto.AccompanyingCount);

            // Le choix « côté » n'a de sens que pour une présence confirmée.
            var side = confirmed ? RsvpSides.Validate(rsvpBlock, dto.Side) : null;
            var extra = confirmed && RsvpSides.OffersExtra(rsvpBlock) ? dto.Extra ?? false : (bool?)null;

            guest.Status = dto.Maybe ? GuestStatus.EnAttente : confirmed ? GuestStatus.Present : GuestStatus.Absent;
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

            rsvp.Confirmed = dto.Maybe ? null : confirmed;
            rsvp.AccompanyingCount = confirmed ? dto.AccompanyingCount : (short)0;
            rsvp.Message = dto.Message;
            rsvp.Side = side;
            rsvp.Extra = extra;
            rsvp.RespondedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            if (_notifier != null)
                await _notifier.NotifyNewRsvpAsync(guest.EventId, guest.FullName, rsvp.Confirmed, rsvp.AccompanyingCount);

            var location = await _context.EventLocations.IgnoreQueryFilters().AsNoTracking()
                .Where(l => l.EventId == guest.EventId)
                .OrderBy(l => l.Position)
                .FirstOrDefaultAsync();

            return MapInvitation(guest, eventEntity, location, rsvp, rules);
        }

        public async Task<PublicInvitationDto?> SubmitPublicEventRsvpAsync(string slug, SubmitPublicEventRsvpDto dto)
        {
            var eventEntity = await _context.Events.IgnoreQueryFilters()
                .FirstOrDefaultAsync(e => e.Slug == slug && e.Status == EventStatus.Publie
                    && !_context.EventModerations.Any(m => m.EventId == e.Id));
            if (eventEntity == null) return null;

            var rsvpBlock = await RsvpBlockContentAsync(eventEntity.Id);
            var rules = RsvpRules.Read(rsvpBlock);
            EnsureOpen(rules, eventEntity);
            var confirmed = dto.Confirmed && !dto.Maybe;
            rules.Validate(confirmed, dto.Maybe, dto.AccompanyingCount);

            var fullName = dto.FullName.Trim();
            var phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();
            var email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim();
            if (fullName.Length == 0)
                throw new InvalidOperationException("Veuillez indiquer votre nom.");
            if (phone == null && email == null)
                throw new InvalidOperationException("Veuillez indiquer un numéro de téléphone ou une adresse e-mail.");

            var side = confirmed ? RsvpSides.Validate(rsvpBlock, dto.Side) : null;
            var extra = confirmed && RsvpSides.OffersExtra(rsvpBlock) ? dto.Extra ?? false : (bool?)null;

            // Déjà sur la liste (même téléphone ou même e-mail) : la réponse va à cet invité,
            // sans doublon. Son identifiant (QR du pass) et son nom ne sont jamais renvoyés :
            // connaître un numéro ne doit pas suffire pour obtenir le pass de quelqu'un.
            var listed = await FindListedGuestAsync(eventEntity.Id, phone, email);
            if (listed != null)
            {
                var answer = await SubmitPublicRsvpAsync(listed.Id, new SubmitPublicRsvpDto
                {
                    Confirmed = dto.Confirmed,
                    Maybe = dto.Maybe,
                    AccompanyingCount = dto.AccompanyingCount,
                    Message = dto.Message,
                    Side = dto.Side,
                    Extra = dto.Extra,
                });
                if (answer == null) return null;
                answer.GuestId = Guid.Empty;
                answer.GuestFullName = fullName;
                answer.CheckedInAt = null;
                answer.LinkedToGuestList = true;
                return answer;
            }
            if (rules.GuestListOnly)
                throw new InvalidOperationException(
                    "Les réponses sont réservées aux invités de la liste. Utilisez le lien personnel reçu, ou le numéro ou l'e-mail donné à l'organisateur.");

            await using var transaction = await OrganizerLock.BeginAsync(_context, eventEntity.OrganizerId);
            if (_plans != null)
                await _plans.EnsureCanAddGuestAsync(eventEntity.OrganizerId, eventEntity.Id);

            var now = DateTimeOffset.UtcNow;
            var guest = new Guest
            {
                Id = Guid.NewGuid(),
                EventId = eventEntity.Id,
                FullName = fullName,
                Phone = phone,
                Email = email,
                Status = dto.Maybe ? GuestStatus.EnAttente : confirmed ? GuestStatus.Present : GuestStatus.Absent,
                CreatedAt = now,
                UpdatedAt = now,
            };
            _context.Guests.Add(guest);
            var response = new RsvpResponse
            {
                Id = Guid.NewGuid(),
                GuestId = guest.Id,
                EventId = eventEntity.Id,
                Confirmed = dto.Maybe ? null : confirmed,
                AccompanyingCount = confirmed ? dto.AccompanyingCount : (short)0,
                Message = string.IsNullOrWhiteSpace(dto.Message) ? null : dto.Message.Trim(),
                Side = side,
                Extra = extra,
                RespondedAt = now,
                CreatedAt = now,
            };
            _context.RsvpResponses.Add(response);

            await _context.SaveChangesAsync();
            if (transaction != null)
                await transaction.CommitAsync();

            if (_notifier != null)
                await _notifier.NotifyNewRsvpAsync(eventEntity.Id, fullName, response.Confirmed, response.AccompanyingCount);

            var location = await _context.EventLocations.IgnoreQueryFilters().AsNoTracking()
                .Where(l => l.EventId == eventEntity.Id)
                .OrderBy(l => l.Position)
                .FirstOrDefaultAsync();

            return MapInvitation(guest, eventEntity, location, response, rules);
        }

        // Invité de l'événement au même e-mail, ou au même numéro (9 derniers chiffres : le
        // même numéro s'écrit « 690… », « +237 690… » ou « 00237 690… »).
        private async Task<Guest?> FindListedGuestAsync(Guid eventId, string? phone, string? email)
        {
            var phoneKey = PhoneKey(phone);
            var emailKey = email?.ToLowerInvariant();
            if (phoneKey == null && emailKey == null) return null;

            var candidates = await _context.Guests.IgnoreQueryFilters()
                .Where(g => g.EventId == eventId
                    && ((emailKey != null && g.Email != null && g.Email.ToLower() == emailKey)
                        || (phoneKey != null && g.Phone != null)))
                .ToListAsync();
            return candidates.FirstOrDefault(g => emailKey != null && string.Equals(g.Email, emailKey, StringComparison.OrdinalIgnoreCase))
                ?? candidates.FirstOrDefault(g => phoneKey != null && PhoneKey(g.Phone) == phoneKey);
        }

        private static string? PhoneKey(string? phone)
        {
            var digits = new string((phone ?? string.Empty).Where(char.IsAsciiDigit).ToArray());
            return digits.Length >= 9 ? digits[^9..] : null;
        }

        private static PublicInvitationDto MapInvitation(Guest guest, Event eventEntity, Event_Location? location, RsvpResponse? rsvp, RsvpRules rules, DateTimeOffset? checkedInAt = null) => new()
        {
            GuestId = guest.Id,
            GuestFullName = guest.FullName,
            EventName = eventEntity.Name,
            EventSlug = eventEntity.Slug,
            EventDate = eventEntity.EventDate,
            EventStartTime = eventEntity.StartTime,
            ThemeColor = eventEntity.ThemeColor,
            Template = ReadTemplate(eventEntity.CustomFields),
            TicketStyle = TicketSettings.Read(eventEntity.CustomFields).Style,
            TicketNote = TicketSettings.Read(eventEntity.CustomFields).Note,
            LocationLabel = location?.Label,
            LocationAddress = location?.Address,
            RsvpConfirmed = rsvp?.Confirmed,
            RsvpAccompanyingCount = rsvp?.AccompanyingCount ?? 0,
            RsvpMessage = rsvp?.Message,
            RsvpSide = rsvp?.Side,
            RsvpExtra = rsvp?.Extra,
            RsvpMaybe = rsvp is { Confirmed: null, RespondedAt: not null },
            RsvpClosed = rules.IsClosed(eventEntity, Today),
            RsvpDeadline = rules.Deadline,
            RsvpMaxCompanions = rules.MaxCompanions,
            RsvpAllowMaybe = rules.AllowMaybe,
            CheckedInAt = checkedInAt,
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

        private static void EnsureOpen(RsvpRules rules, Event eventEntity)
        {
            if (!rules.IsClosed(eventEntity, Today)) return;
            throw new InvalidOperationException(eventEntity.EventDate.HasValue && eventEntity.EventDate.Value < Today
                ? "Les réponses sont closes : l'événement a déjà eu lieu."
                : "Les réponses sont closes : la date limite est passée.");
        }

        private static GuestDTO Map(Guest entity, DateTimeOffset? checkedInAt) => new()
        {
            CheckedInAt = checkedInAt,
            Id = entity.Id,
            FullName = entity.FullName,
            Phone = entity.Phone ?? string.Empty,
            Email = entity.Email ?? string.Empty,
            GroupId = entity.GroupId,
            Seats = entity.Seats,
            Status = entity.Status,
            InvitationOpenedAt = entity.InvitationOpenedAt,
            InvitationSharedAt = entity.InvitationSharedAt
        };
    }
}
