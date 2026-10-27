using backend_EventMoment.Dtos;

namespace backend_EventMoment.Interfaces
{
    public interface IGalleryService
    {
        Task<GalleryPhotoDto> CreateAsync(string url, string? uploadedBy, Guid eventId, Guid organizerId);
        Task<List<GalleryPhotoDto>> GetAllAsync(Guid eventId, Guid organizerId);
        Task<GalleryPhotoDto> UpdateStatusAsync(Guid id, UpdateGalleryPhotoStatusDto dto, Guid organizerId);
        Task<string?> DeleteAsync(Guid id, Guid organizerId);
        Task<(Guid EventId, Guid OrganizerId)?> FindGuestUploadEventAsync(string slug);
        Task<GalleryPhotoDto> CreateGuestPhotoAsync(Guid eventId, string url, string? uploadedBy);
    }
}
