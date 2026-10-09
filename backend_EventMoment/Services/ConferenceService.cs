using backend_EventMoment.Data;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    public class ConferenceService : IConferenceService
    {
        private readonly AdminDbContext _context;

        public ConferenceService(AdminDbContext context)
        {
            _context = context;
        }

        private Task<bool> OwnsEventAsync(Guid eventId, Guid organizerId) =>
            _context.Events.AnyAsync(e => e.Id == eventId && e.OrganizerId == organizerId);

        public async Task<SpeakerDto> CreateSpeakerAsync(CreateSpeakerDto dto, Guid eventId, Guid organizerId)
        {
            if (!await OwnsEventAsync(eventId, organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entity = new Speaker
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                FullName = dto.FullName,
                Title = dto.Title,
                Bio = dto.Topic,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Speakers.Add(entity);
            await _context.SaveChangesAsync();
            return Map(entity);
        }

        public async Task<List<SpeakerDto>> GetSpeakersAsync(Guid eventId, Guid organizerId)
        {
            if (!await OwnsEventAsync(eventId, organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entities = await _context.Speakers.Where(s => s.EventId == eventId).OrderBy(s => s.CreatedAt).ToListAsync();
            return entities.Select(Map).ToList();
        }

        public async Task<bool> DeleteSpeakerAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.Speakers.FirstOrDefaultAsync(s => s.Id == id && s.Event.OrganizerId == organizerId);
            if (entity == null) return false;

            _context.Speakers.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ConferenceSessionDto> CreateSessionAsync(CreateConferenceSessionDto dto, Guid eventId, Guid organizerId)
        {
            if (!await OwnsEventAsync(eventId, organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            if (dto.SpeakerId.HasValue && !await _context.Speakers.AnyAsync(s => s.Id == dto.SpeakerId && s.EventId == eventId))
                throw new KeyNotFoundException("Intervenant introuvable.");

            var entity = new ConferenceSession
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                Title = dto.Title,
                Room = dto.Room,
                SpeakerId = dto.SpeakerId,
                StartTime = dto.StartTime?.ToUniversalTime(),
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.ConferenceSessions.Add(entity);
            await _context.SaveChangesAsync();

            var speakerName = dto.SpeakerId.HasValue
                ? (await _context.Speakers.AsNoTracking().FirstOrDefaultAsync(s => s.Id == dto.SpeakerId))?.FullName
                : null;
            return Map(entity, speakerName);
        }

        public async Task<List<ConferenceSessionDto>> GetSessionsAsync(Guid eventId, Guid organizerId)
        {
            if (!await OwnsEventAsync(eventId, organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            return await _context.ConferenceSessions
                .Where(s => s.EventId == eventId)
                .OrderBy(s => s.StartTime)
                .Select(s => new ConferenceSessionDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Room = s.Room,
                    SpeakerId = s.SpeakerId,
                    SpeakerName = s.Speaker != null ? s.Speaker.FullName : null,
                    StartTime = s.StartTime
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteSessionAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.ConferenceSessions.FirstOrDefaultAsync(s => s.Id == id && s.Event.OrganizerId == organizerId);
            if (entity == null) return false;

            _context.ConferenceSessions.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SponsorDto> CreateSponsorAsync(CreateSponsorDto dto, Guid eventId, Guid organizerId)
        {
            if (!await OwnsEventAsync(eventId, organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entity = new Sponsor
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                Name = dto.Name,
                Tier = dto.Tier,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Sponsors.Add(entity);
            await _context.SaveChangesAsync();
            return new SponsorDto { Id = entity.Id, Name = entity.Name, Tier = entity.Tier };
        }

        public async Task<List<SponsorDto>> GetSponsorsAsync(Guid eventId, Guid organizerId)
        {
            if (!await OwnsEventAsync(eventId, organizerId))
                throw new KeyNotFoundException("Événement introuvable.");

            var entities = await _context.Sponsors.Where(s => s.EventId == eventId).OrderBy(s => s.CreatedAt).ToListAsync();
            return entities.Select(s => new SponsorDto { Id = s.Id, Name = s.Name, Tier = s.Tier }).ToList();
        }

        public async Task<bool> DeleteSponsorAsync(Guid id, Guid organizerId)
        {
            var entity = await _context.Sponsors.FirstOrDefaultAsync(s => s.Id == id && s.Event.OrganizerId == organizerId);
            if (entity == null) return false;

            _context.Sponsors.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static SpeakerDto Map(Speaker entity) => new()
        {
            Id = entity.Id,
            FullName = entity.FullName,
            Title = entity.Title,
            Topic = entity.Bio
        };

        private static ConferenceSessionDto Map(ConferenceSession entity, string? speakerName) => new()
        {
            Id = entity.Id,
            Title = entity.Title,
            Room = entity.Room,
            SpeakerId = entity.SpeakerId,
            SpeakerName = speakerName,
            StartTime = entity.StartTime
        };
    }
}
