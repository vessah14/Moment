namespace backend_EventMoment.Dtos
{
    public class PublicSiteBlockDto
    {
        public string BlockType { get; set; } = string.Empty;
        public short Position { get; set; }
        public string Content { get; set; } = "{}";
    }

    // Mur du jour J (/e/{slug}/mur), projeté dans la salle : dernières photos et derniers
    // messages publiés, relu toutes les quelques secondes.
    public class PublicWallDto
    {
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? ThemeColor { get; set; }
        public List<GalleryPhotoDto> Photos { get; set; } = new();
        public List<PublicGuestBookEntryDto> Messages { get; set; } = new();
        // Mur des vœux (modèle Envol) : nombre de vœux publiés, modèle, date et organisation.
        public int MessageCount { get; set; }
        public string? Template { get; set; }
        public DateOnly? EventDate { get; set; }
        public string? OrganizerName { get; set; }
        public string? OrganizerLogoUrl { get; set; }
    }

    public class PublicGuestBookEntryDto
    {
        public string AuthorName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Reply { get; set; }
        public string? Service { get; set; }
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
        // Faux si l'offre de l'organisateur retire la mention « Créé avec TBF MOMENT ».
        public bool ShowBranding { get; set; } = true;
        // Modèle de billet et mention sous le QR code (null = modèle conseillé pour le modèle de site).
        public string? TicketStyle { get; set; }
        public string? TicketNote { get; set; }
        // Organisateur affiché sur la page (« Organisé par … ») ; logo seulement avec l'offre Business et plus.
        public string? OrganizerName { get; set; }
        public string? OrganizerLogoUrl { get; set; }
    }
}
