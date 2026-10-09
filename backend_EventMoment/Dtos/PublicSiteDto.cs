namespace backend_EventMoment.Dtos
{
    public class PublicSiteBlockDto
    {
        public string BlockType { get; set; } = string.Empty;
        public short Position { get; set; }
        public string Content { get; set; } = "{}";
    }

    public class PublicGuestBookEntryDto
    {
        public string AuthorName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Reply { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    // Agrège tout ce dont le mini-site public a besoin en un seul appel : la
    // composition de blocs choisie dans le Builder, plus les données réelles
    // (programme, galerie, livre d'or publié, billetterie) — jamais de contenu
    // dupliqué ou inventé, toujours lu depuis les mêmes tables que le tableau
    // de bord de l'organisateur.
    public class PublicSiteDto
    {
        public PublicEventDto Event { get; set; } = null!;
        public List<PublicSiteBlockDto> Blocks { get; set; } = new();
        public List<ProgramItemDto> ProgramItems { get; set; } = new();
        public List<GalleryPhotoDto> GalleryPhotos { get; set; } = new();
        public List<PublicGuestBookEntryDto> GuestBookEntries { get; set; } = new();
        public List<TicketTypeDto> TicketTypes { get; set; } = new();
    }
}
