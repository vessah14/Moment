using Microsoft.EntityFrameworkCore;
using backend_EventMoment.Models;

namespace backend_EventMoment.Data
{
    public class SignupDbContext : DbContext
    {
        public SignupDbContext(DbContextOptions<SignupDbContext> options) : base(options) { }

        public DbSet<Utilisateur> Organizers { get; set; }
        public DbSet<ExternalLogin> ExternalLogins { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresExtension("citext");

            modelBuilder.Entity<Utilisateur>()
                .Property(o => o.Email)
                .HasColumnType("citext");

            modelBuilder.Entity<Utilisateur>()
                .HasIndex(o => o.Email)
                .IsUnique();

            // Colonnes générées côté base — app_signup n'a pas le droit d'écrire dessus,
            // donc EF Core ne doit JAMAIS les inclure dans l'INSERT.
            modelBuilder.Entity<Utilisateur>()
                .Property(o => o.Id)
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<Utilisateur>()
                .Property(o => o.IsActive)
                .ValueGeneratedOnAdd()
                .Metadata.SetAfterSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

            modelBuilder.Entity<Utilisateur>()
                .Property(o => o.CreatedAt)
                .ValueGeneratedOnAdd()
                .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

            modelBuilder.Entity<Utilisateur>()
                .Property(o => o.UpdatedAt)
                .ValueGeneratedOnAdd()
                .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

            // ExternalLogins : nécessaire pour la connexion Google/Apple (créer le compte
            // organisateur et le lien externe en une seule transaction avec le même rôle
            // app_signup, qui a les droits SELECT+INSERT sur les deux tables).
            modelBuilder.Entity<ExternalLogin>()
                .HasIndex(x => new { x.Provider, x.ProviderUserId })
                .IsUnique();

            modelBuilder.Entity<ExternalLogin>()
                .HasOne(x => x.Organizer)
                .WithMany()
                .HasForeignKey(x => x.OrganizerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ExternalLogin>()
                .Property(x => x.Id)
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<ExternalLogin>()
                .Property(x => x.CreatedAt)
                .ValueGeneratedOnAdd()
                .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);
        }
    }
}