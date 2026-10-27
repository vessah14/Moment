using backend_EventMoment.Models;
using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

// Album des invités et mur du jour J : rien n'est visible sans validation de l'organisateur.
public class GuestAlbumAndWallTests
{
    private static Event SeedPublishedEvent(backend_EventMoment.Data.AdminDbContext context, string? galleryContent = "{}")
    {
        var evt = new Event
        {
            Id = Guid.NewGuid(),
            OrganizerId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid(),
            Name = "Dot de Brenda",
            Slug = "dot-brenda",
            Status = EventStatus.Publie,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        context.Events.Add(evt);
        if (galleryContent != null)
            context.EventBlocks.Add(new EventBlock
            {
                Id = Guid.NewGuid(), EventId = evt.Id, BlockType = "Galerie", Position = 1, IsVisible = true,
                Content = galleryContent, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow,
            });
        context.SaveChanges();
        return evt;
    }

    [Fact]
    public async Task GuestPhoto_IsPending_AndOnlyWhenTheGalleryIsOpen()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var evt = SeedPublishedEvent(context);
        var service = new GalleryService(context);

        var target = await service.FindGuestUploadEventAsync(evt.Slug);
        Assert.Equal((evt.Id, evt.OrganizerId), target);
        var photo = await service.CreateGuestPhotoAsync(evt.Id, "/uploads/gallery/x.jpg", "  Tata Odile  ");
        Assert.Equal(GalleryPhotoStatus.EnAttente, photo.Status);
        Assert.Equal("Tata Odile", photo.UploadedBy);

        var closed = TestDbContextFactory.CreateAdminContext();
        var closedEvent = SeedPublishedEvent(closed, """{"guestUploads":false}""");
        Assert.Null(await new GalleryService(closed).FindGuestUploadEventAsync(closedEvent.Slug));

        var noGallery = TestDbContextFactory.CreateAdminContext();
        var noGalleryEvent = SeedPublishedEvent(noGallery, null);
        Assert.Null(await new GalleryService(noGallery).FindGuestUploadEventAsync(noGalleryEvent.Slug));
    }

    [Fact]
    public async Task Wall_ShowsOnlyApprovedPhotosAndMessages()
    {
        var context = TestDbContextFactory.CreateAdminContext();
        var evt = SeedPublishedEvent(context);
        context.GalleryPhotos.Add(new GalleryPhoto { Id = Guid.NewGuid(), EventId = evt.Id, Url = "/ok.jpg", Status = GalleryPhotoStatus.Publie, CreatedAt = DateTimeOffset.UtcNow });
        context.GalleryPhotos.Add(new GalleryPhoto { Id = Guid.NewGuid(), EventId = evt.Id, Url = "/pending.jpg", Status = GalleryPhotoStatus.EnAttente, CreatedAt = DateTimeOffset.UtcNow });
        context.GuestBookEntries.Add(new GuestBookEntry { Id = Guid.NewGuid(), EventId = evt.Id, AuthorName = "Paul", Message = "Bravo !", Status = GuestBookStatus.Publie, CreatedAt = DateTimeOffset.UtcNow });
        context.GuestBookEntries.Add(new GuestBookEntry { Id = Guid.NewGuid(), EventId = evt.Id, AuthorName = "X", Message = "spam", Status = GuestBookStatus.EnAttente, CreatedAt = DateTimeOffset.UtcNow });
        context.SaveChanges();

        var wall = await new PublicSiteService(context).GetWallAsync(evt.Slug);

        Assert.Equal("Dot de Brenda", wall!.Title);
        Assert.Equal("/ok.jpg", Assert.Single(wall.Photos).Url);
        Assert.Equal("Bravo !", Assert.Single(wall.Messages).Message);
        Assert.Null(await new PublicSiteService(context).GetWallAsync("inconnu"));
    }
}
