// Data/AdminDbContext.cs — connecté en tant que app_admin
using Microsoft.EntityFrameworkCore;
using backend_EventMoment.Models;
using System.Security.Claims;

namespace backend_EventMoment.Data
{
    public class AdminDbContext : DbContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        // Le fournisseur de paiement est lu au démarrage avant la construction du modèle EF.
        public static bool SasPayEnabled { get; set; }

        public AdminDbContext(DbContextOptions<AdminDbContext> options, IHttpContextAccessor httpContextAccessor) : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid CurrentOrganizerId => Guid.TryParse(_httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id)
            && _httpContextAccessor.HttpContext?.User.FindFirst("type")?.Value == "organizer" ? id : Guid.Empty;

        // Comptes
        public DbSet<Utilisateur> Organizers { get; set; }
        public DbSet<AdminAccount> AdminAccounts { get; set; }
        public DbSet<AdminMfa> AdminMfas { get; set; }
        public DbSet<AdminActivityLog> AdminActivityLogs { get; set; }
        public DbSet<TechnicalErrorLog> TechnicalErrorLogs { get; set; }

        // Catalogue / configuration
        public DbSet<Event_categorie> EventCategories { get; set; }
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }

        // Cœur métier événement
        public DbSet<Event> Events { get; set; }
        public DbSet<Event_Location> EventLocations { get; set; }
        public DbSet<EventBlock> EventBlocks { get; set; }
        public DbSet<Guest_group> GuestGroups { get; set; }
        public DbSet<Guest> Guests { get; set; }
        public DbSet<RsvpResponse> RsvpResponses { get; set; }
        public DbSet<EventStatsDaily> EventStatsDailies { get; set; }

        // Abonnements
        public DbSet<UserSubscription> OrganizerSubscriptions { get; set; }
        public DbSet<SubscriptionPayment> SubscriptionPayments { get; set; }

        // Livre d'or
        public DbSet<GuestBookEntry> GuestBookEntries { get; set; }

        // Plan de table
        public DbSet<EventTable> EventTables { get; set; }
        public DbSet<SeatingAssignment> SeatingAssignments { get; set; }

        // Liste de cadeaux
        public DbSet<GiftItem> GiftItems { get; set; }

        // Billetterie
        public DbSet<TicketType> TicketTypes { get; set; }
        public DbSet<TicketSale> TicketSales { get; set; }

        // Conférence
        public DbSet<Speaker> Speakers { get; set; }
        public DbSet<ConferenceSession> ConferenceSessions { get; set; }
        public DbSet<Sponsor> Sponsors { get; set; }

        // Programme
        public DbSet<ProgramItem> ProgramItems { get; set; }

        // Communication
        public DbSet<MessageCampaign> MessageCampaigns { get; set; }

        // Galerie
        public DbSet<GalleryPhoto> GalleryPhotos { get; set; }

        // Modération, vérification e-mail, notifications, rappels automatiques
        public DbSet<EventModeration> EventModerations { get; set; }
        public DbSet<OrganizerEmailVerification> OrganizerEmailVerifications { get; set; }
        public DbSet<OrganizerNotificationSettings> OrganizerNotificationSettings { get; set; }
        public DbSet<EventReminder> EventReminders { get; set; }
        public DbSet<GuestCheckin> GuestCheckins { get; set; }

        // Offres : demandes de passage à une offre payante, avis des clients
        public DbSet<PlanUpgradeRequest> PlanUpgradeRequests { get; set; }
        public DbSet<PlatformReview> PlatformReviews { get; set; }

        // Liens d'invitation envoyés automatiquement aux invités
        public DbSet<GuestInvitation> GuestInvitations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // -----------------------------------------------------------
            // Enums PostgreSQL
            // -----------------------------------------------------------
            modelBuilder.HasPostgresEnum<EventStatus>("event_status");
            modelBuilder.HasPostgresEnum<GuestStatus>("guest_status");
            modelBuilder.HasPostgresEnum<PlanBilling>("plan_billing");
            modelBuilder.HasPostgresEnum<SubscriptionStatus>("subscription_status");
            modelBuilder.HasPostgresEnum<AdminRole>("admin_role");
            // block_type reste TEXT en base (pas un vrai enum PostgreSQL) —
            // pas de HasPostgresEnum ici, voir remarque sous le tableau.

            // Extension nécessaire pour les colonnes CITEXT (email)
            modelBuilder.HasPostgresExtension("citext");

            // -----------------------------------------------------------
            // Organizer
            // -----------------------------------------------------------
            modelBuilder.Entity<Utilisateur>()
                .Property(o => o.Email)
                .HasColumnType("citext");

            modelBuilder.Entity<Utilisateur>()
                .HasIndex(o => o.Email)
                .IsUnique();

            // -----------------------------------------------------------
            // AdminAccount
            // -----------------------------------------------------------
            modelBuilder.Entity<AdminAccount>()
                .Property(a => a.Email)
                .HasColumnType("citext");

            modelBuilder.Entity<AdminAccount>()
                .HasIndex(a => a.Email)
                .IsUnique();

            modelBuilder.Entity<AdminAccount>()
                .Property(a => a.Role)
                .HasColumnType("admin_role");

            modelBuilder.Entity<AdminAccount>()
                .HasOne(a => a.CreatedByAdmin)
                .WithMany()
                .HasForeignKey(a => a.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AdminActivityLog>()
                .HasIndex(log => log.CreatedAt);

            modelBuilder.Entity<TechnicalErrorLog>()
                .HasIndex(log => log.CreatedAt);

            // -----------------------------------------------------------
            // EventCategory
            // -----------------------------------------------------------
            modelBuilder.Entity<Event_categorie>()
                .HasIndex(c => c.Code)
                .IsUnique();

            // -----------------------------------------------------------
            // SubscriptionPlan
            // -----------------------------------------------------------
            modelBuilder.Entity<SubscriptionPlan>()
                .Property(p => p.Billing)
                .HasColumnType("plan_billing");

            modelBuilder.Entity<SubscriptionPlan>()
                .HasIndex(p => p.Code)
                .IsUnique();

            // -----------------------------------------------------------
            // Event
            // -----------------------------------------------------------
            modelBuilder.Entity<Event>()
                .Property(e => e.Status)
                .HasColumnType("event_status");

            modelBuilder.Entity<Event>()
                .HasIndex(e => e.Slug)
                .IsUnique();
            modelBuilder.Entity<Event>().HasQueryFilter(e => e.OrganizerId == CurrentOrganizerId);

            modelBuilder.Entity<Event>()
                .HasOne(e => e.Utilisateur)
                .WithMany()
                .HasForeignKey(e => e.OrganizerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Event>()
                .HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // -----------------------------------------------------------
            // EventLocation
            // -----------------------------------------------------------
            modelBuilder.Entity<Event_Location>().HasQueryFilter(l => l.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<Event_Location>()
                .Property(l => l.Lattitude)
                .HasColumnType("numeric(9,6)");

            modelBuilder.Entity<Event_Location>()
                .Property(l => l.Longitude)
                .HasColumnType("numeric(9,6)");

            modelBuilder.Entity<Event_Location>()
                .HasOne(l => l.Event)
                .WithMany()
                .HasForeignKey(l => l.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // EventBlock
            // -----------------------------------------------------------
            modelBuilder.Entity<EventBlock>().HasQueryFilter(b => b.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<EventBlock>()
                .Property(b => b.Content)
                .HasColumnType("jsonb");

            modelBuilder.Entity<EventBlock>()
                .HasIndex(b => new { b.EventId, b.Position })
                .IsUnique();

            modelBuilder.Entity<EventBlock>()
                .HasOne(b => b.Event)
                .WithMany()
                .HasForeignKey(b => b.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // GuestGroup
            // -----------------------------------------------------------
            modelBuilder.Entity<Guest_group>().HasQueryFilter(g => Events.Any(e => e.Id == g.EventId && e.OrganizerId == CurrentOrganizerId));
            modelBuilder.Entity<Guest_group>()
                .HasIndex(g => new { g.EventId, g.Label })
                .IsUnique();

            modelBuilder.Entity<Guest_group>()
                .HasOne<Event>()
                .WithMany()
                .HasForeignKey(g => g.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // Guest
            // -----------------------------------------------------------
            modelBuilder.Entity<Guest>().HasQueryFilter(g => g.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<Guest>()
                .Property(g => g.Status)
                .HasColumnType("guest_status");

            modelBuilder.Entity<Guest>()
                .Property(g => g.Email)
                .HasColumnType("citext");

            modelBuilder.Entity<Guest>()
                .HasOne(g => g.Event)
                .WithMany()
                .HasForeignKey(g => g.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Guest>()
                .HasOne(g => g.GuestGroup)
                .WithMany()
                .HasForeignKey(g => g.GroupId)
                .OnDelete(DeleteBehavior.SetNull);

            // -----------------------------------------------------------
            // RsvpResponse
            // -----------------------------------------------------------
            modelBuilder.Entity<RsvpResponse>().HasQueryFilter(r => r.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<RsvpResponse>()
                .HasOne(r => r.Guest)
                .WithMany()
                .HasForeignKey(r => r.GuestId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RsvpResponse>()
                .HasOne(r => r.Event)
                .WithMany()
                .HasForeignKey(r => r.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // EventStatsDaily
            // -----------------------------------------------------------
            modelBuilder.Entity<EventStatsDaily>()
                .HasIndex(s => new { s.EventId, s.StatDate })
                .IsUnique();

            modelBuilder.Entity<EventStatsDaily>()
                .HasOne(s => s.Event)
                .WithMany()
                .HasForeignKey(s => s.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // OrganizerSubscription
            // -----------------------------------------------------------
            modelBuilder.Entity<UserSubscription>().HasQueryFilter(s => s.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<UserSubscription>()
                .Property(s => s.Status)
                .HasColumnType("subscription_status");

            // Base en mémoire (tests) : pas de colonnes à respecter, le modèle complet est gardé.
            if (SasPayEnabled || !Database.IsNpgsql())
            {
                modelBuilder.Entity<UserSubscription>()
                    .HasIndex(s => s.PaymentId)
                    .IsUnique()
                    .HasFilter("kpay_payment_id IS NOT NULL");
                modelBuilder.Entity<SubscriptionPayment>()
                    .HasIndex(p => new { p.OrganizerId, p.IdempotencyKey })
                    .IsUnique()
                    .HasFilter("idempotency_key IS NOT NULL");
            }
            else
            {
                // Le paiement en ligne est désactivé : sa migration peut ne pas exister en base.
                modelBuilder.Entity<UserSubscription>().Ignore(s => s.PaymentId);
                modelBuilder.Ignore<SubscriptionPayment>();
            }

            modelBuilder.Entity<UserSubscription>()
                .HasOne<Utilisateur>()
                .WithMany()
                .HasForeignKey(s => s.OrganizerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserSubscription>()
                .HasOne(s => s.Plan)
                .WithMany()
                .HasForeignKey(s => s.PlanId)
                .OnDelete(DeleteBehavior.Restrict);

            // -----------------------------------------------------------
            // GuestBookEntry
            // -----------------------------------------------------------
            modelBuilder.Entity<GuestBookEntry>().HasQueryFilter(g => g.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<GuestBookEntry>()
                .Property(g => g.Status)
                .HasConversion<string>();

            modelBuilder.Entity<GuestBookEntry>()
                .HasOne(g => g.Event)
                .WithMany()
                .HasForeignKey(g => g.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // EventTable / SeatingAssignment
            // -----------------------------------------------------------
            modelBuilder.Entity<EventTable>().HasQueryFilter(t => t.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<EventTable>()
                .HasOne(t => t.Event)
                .WithMany()
                .HasForeignKey(t => t.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SeatingAssignment>().HasQueryFilter(a => a.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<SeatingAssignment>()
                .HasIndex(a => a.GuestId)
                .IsUnique();
            modelBuilder.Entity<SeatingAssignment>()
                .HasOne(a => a.Event)
                .WithMany()
                .HasForeignKey(a => a.EventId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<SeatingAssignment>()
                .HasOne(a => a.Guest)
                .WithMany()
                .HasForeignKey(a => a.GuestId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<SeatingAssignment>()
                .HasOne(a => a.Table)
                .WithMany()
                .HasForeignKey(a => a.TableId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // GiftItem
            // -----------------------------------------------------------
            modelBuilder.Entity<GiftItem>().HasQueryFilter(g => g.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<GiftItem>()
                .HasOne(g => g.Event)
                .WithMany()
                .HasForeignKey(g => g.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // TicketType / TicketSale
            // -----------------------------------------------------------
            modelBuilder.Entity<TicketType>().HasQueryFilter(t => t.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<TicketType>()
                .HasOne(t => t.Event)
                .WithMany()
                .HasForeignKey(t => t.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TicketSale>().HasQueryFilter(s => s.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<TicketSale>()
                .Property(s => s.Status)
                .HasConversion<string>();
            modelBuilder.Entity<TicketSale>()
                .HasOne(s => s.TicketType)
                .WithMany()
                .HasForeignKey(s => s.TicketTypeId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<TicketSale>()
                .HasOne(s => s.Event)
                .WithMany()
                .HasForeignKey(s => s.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // Speaker / ConferenceSession / Sponsor
            // -----------------------------------------------------------
            modelBuilder.Entity<Speaker>().HasQueryFilter(s => s.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<Speaker>()
                .HasOne(s => s.Event)
                .WithMany()
                .HasForeignKey(s => s.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ConferenceSession>().HasQueryFilter(s => s.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<ConferenceSession>()
                .HasOne(s => s.Event)
                .WithMany()
                .HasForeignKey(s => s.EventId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<ConferenceSession>()
                .HasOne(s => s.Speaker)
                .WithMany()
                .HasForeignKey(s => s.SpeakerId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Sponsor>().HasQueryFilter(s => s.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<Sponsor>()
                .HasOne(s => s.Event)
                .WithMany()
                .HasForeignKey(s => s.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // ProgramItem
            // -----------------------------------------------------------
            modelBuilder.Entity<ProgramItem>().HasQueryFilter(p => p.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<ProgramItem>()
                .HasOne(p => p.Event)
                .WithMany()
                .HasForeignKey(p => p.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // MessageCampaign
            // -----------------------------------------------------------
            modelBuilder.Entity<MessageCampaign>().HasQueryFilter(c => c.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<MessageCampaign>()
                .Property(c => c.Status)
                .HasConversion<string>();
            modelBuilder.Entity<MessageCampaign>()
                .HasOne(c => c.Event)
                .WithMany()
                .HasForeignKey(c => c.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // GalleryPhoto
            // -----------------------------------------------------------
            modelBuilder.Entity<GalleryPhoto>().HasQueryFilter(p => p.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<GalleryPhoto>()
                .Property(p => p.Status)
                .HasConversion<string>();
            modelBuilder.Entity<GalleryPhoto>()
                .HasOne(p => p.Event)
                .WithMany()
                .HasForeignKey(p => p.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // PlanUpgradeRequest / PlatformReview — statuts stockés en texte (nom de l'enum),
            // pas de filtre organisateur : l'admin les liste tous, les services filtrent.
            // -----------------------------------------------------------
            modelBuilder.Entity<PlanUpgradeRequest>()
                .Property(r => r.Status)
                .HasConversion<string>();
            modelBuilder.Entity<PlanUpgradeRequest>()
                .HasOne(r => r.Plan)
                .WithMany()
                .HasForeignKey(r => r.PlanId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<PlatformReview>()
                .Property(r => r.Status)
                .HasConversion<string>();

            // GuestInvitation : relation déclarée pour qu'EF insère l'invité avant son invitation
            // (sinon violation de clé étrangère quand les deux sont créés ensemble).
            modelBuilder.Entity<GuestInvitation>()
                .HasOne<Guest>()
                .WithOne()
                .HasForeignKey<GuestInvitation>(i => i.GuestId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<GuestInvitation>()
                .HasOne<Event>()
                .WithMany()
                .HasForeignKey(i => i.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // EventModeration — pas de filtre organisateur : c'est la modération
            // qui écrit ici, et les requêtes publiques doivent toujours la voir.
            // -----------------------------------------------------------
            modelBuilder.Entity<EventModeration>()
                .HasOne(m => m.Event)
                .WithOne()
                .HasForeignKey<EventModeration>(m => m.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // EventReminder
            // -----------------------------------------------------------
            modelBuilder.Entity<EventReminder>().HasQueryFilter(r => r.Event.OrganizerId == CurrentOrganizerId);
            modelBuilder.Entity<EventReminder>()
                .HasIndex(r => new { r.EventId, r.Kind })
                .IsUnique();
            modelBuilder.Entity<EventReminder>()
                .HasOne(r => r.Event)
                .WithMany()
                .HasForeignKey(r => r.EventId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
