using Microsoft.EntityFrameworkCore;
using backend_EventMoment.Models; // ajustez selon le vrai namespace

namespace backend_EventMoment.Data
{
    public class ClientDbContext : DbContext
    {
        public ClientDbContext(DbContextOptions<ClientDbContext> options) : base(options) { }

        public DbSet<Event> Events { get; set; }
        public DbSet<Event_Location> Event_Locations { get; set; }
        public DbSet<EventBlock> EventBlocks { get; set; }
        public DbSet<Guest> Guests { get; set; }
        public DbSet<Guest_group> Guest_groups { get; set; }
        public DbSet<RsvpResponse> RsvpResponses { get; set; }
        public DbSet<EventStatsDaily> EventStatsDailies { get; set; }
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<UserSubscription> UserSubscriptions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresEnum<EventStatus>("event_status");

            modelBuilder.Entity<Event>()
                .Property(e => e.Status)
                .HasColumnType("event_status");

            modelBuilder.Entity<Event_Location>()
                .HasOne(el => el.Event)
                .WithMany()
                .HasForeignKey(el => el.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EventBlock>()
                .HasIndex(eb => new { eb.EventId, eb.Position })
                .IsUnique();

            modelBuilder.Entity<EventBlock>()
                .HasOne(eb => eb.Event)
                .WithMany()
                .HasForeignKey(eb => eb.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.HasPostgresEnum<GuestStatus>("guest_status");

            modelBuilder.Entity<Guest>()
                .Property(g => g.Status)
                .HasColumnType("guest_status");

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

            // Nécessaire pour l'extension PostgreSQL CITEXT
            modelBuilder.HasPostgresExtension("citext");

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

            modelBuilder.Entity<EventStatsDaily>()
                .HasIndex(s => new { s.EventId, s.StatDate })
                .IsUnique();

            modelBuilder.Entity<EventStatsDaily>()
                .HasOne(s => s.Event)
                .WithMany()
                .HasForeignKey(s => s.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // block_type est une colonne text libre (voir Models/Event_blocks.cs),
            // aucun mapping d'enum nécessaire ici.
        }
    }
}