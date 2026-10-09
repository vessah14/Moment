using backend_EventMoment.Models;
using backend_EventMoment.Services;

namespace backend_EventMoment.Tests;

public class PublicSeatingServiceTests
{
    // Événement publié avec deux tables : Fatou Ndiaye à la table 1 « Rose », deux
    // « Paul Mbarga » (homonymes) aux tables 1 et 2.
    private static (Data.AdminDbContext db, string slug) Seed(bool withSeatingBlock = true, EventStatus status = EventStatus.Publie)
    {
        var db = TestDbContextFactory.CreateAdminContext();
        var now = DateTimeOffset.UtcNow;
        var organizer = new Utilisateur { Id = Guid.NewGuid(), Email = "o@example.com", PasswordHash = "h", FullName = "O", IsActive = true, CreatedAt = now, UpdatedAt = now };
        var category = new Event_categorie { Id = Guid.NewGuid(), Code = "mariage", Label = "Mariage", Is_active = true, CreatedAt = now, UpdateAt = now };
        var evt = new Event { Id = Guid.NewGuid(), OrganizerId = organizer.Id, CategoryId = category.Id, Name = "Mariage", Slug = "mariage-" + Guid.NewGuid(), Status = status, CreatedAt = now, UpdatedAt = now };
        db.AddRange(organizer, category, evt);
        if (withSeatingBlock)
            db.EventBlocks.Add(new EventBlock { Id = Guid.NewGuid(), EventId = evt.Id, BlockType = "Plan de table", Position = 1, IsVisible = true, Content = "{}" });

        var t1 = new EventTable { Id = Guid.NewGuid(), EventId = evt.Id, Label = "Rose", Capacity = 8, Position = 0, CreatedAt = now };
        var t2 = new EventTable { Id = Guid.NewGuid(), EventId = evt.Id, Label = "Jasmin", Capacity = 6, Position = 1, CreatedAt = now };
        db.AddRange(t1, t2);

        void Seat(string name, EventTable table)
        {
            var guest = new Guest { Id = Guid.NewGuid(), EventId = evt.Id, FullName = name, CreatedAt = now };
            db.Guests.Add(guest);
            db.SeatingAssignments.Add(new SeatingAssignment { Id = Guid.NewGuid(), EventId = evt.Id, GuestId = guest.Id, TableId = table.Id, CreatedAt = now });
        }
        Seat("Fatou Ndiaye", t1);
        Seat("Paul Mbarga", t1);
        Seat("Paul Mbarga", t2);
        db.SaveChanges();
        return (db, evt.Slug);
    }

    [Theory]
    [InlineData("Fatou Ndiaye")]
    [InlineData("  ndiaye   FATOU ")]
    [InlineData("Fatou Ndiayé")]
    public async Task Finds_the_table_from_the_full_name(string query)
    {
        var (db, slug) = Seed();
        var result = await new PublicSeatingService(db).FindSeatAsync(slug, query);
        Assert.NotNull(result);
        Assert.True(result!.Found);
        Assert.Equal(1, result.Number);
        Assert.Equal("Rose", result.Label);
    }

    [Theory]
    [InlineData("Fatou")]       // partiel : ne révèle rien
    [InlineData("Fat")]
    [InlineData("Paul Mbarga")] // homonymes à deux tables : pas de devinette
    [InlineData("Inconnu Total")]
    public async Task Reveals_nothing_without_an_exact_unique_match(string query)
    {
        var (db, slug) = Seed();
        var result = await new PublicSeatingService(db).FindSeatAsync(slug, query);
        Assert.NotNull(result);
        Assert.False(result!.Found);
        Assert.Null(result.Number);
        Assert.Null(result.Label);
    }

    [Fact]
    public async Task Tables_list_has_no_guest_names()
    {
        var (db, slug) = Seed();
        var tables = await new PublicSeatingService(db).GetTablesAsync(slug);
        Assert.NotNull(tables);
        Assert.Equal(new[] { "Rose", "Jasmin" }, tables!.Select(t => t.Label));
        Assert.Equal(new[] { 1, 2 }, tables.Select(t => t.Number));
    }

    [Fact]
    public async Task Unavailable_without_the_seating_block_or_when_unpublished()
    {
        var (db1, slug1) = Seed(withSeatingBlock: false);
        Assert.Null(await new PublicSeatingService(db1).GetTablesAsync(slug1));
        Assert.Null(await new PublicSeatingService(db1).FindSeatAsync(slug1, "Fatou Ndiaye"));

        var (db2, slug2) = Seed(status: EventStatus.Brouillon);
        Assert.Null(await new PublicSeatingService(db2).GetTablesAsync(slug2));
    }

    [Theory]
    [InlineData("Fatou Ndiaye", "fatou ndiaye")]
    [InlineData("NDIAYE, Fatou", "fatou ndiaye")]
    [InlineData("Aïssatou Bâ", "aissatou ba")]
    [InlineData("", "")]
    public void NameKey_ignores_case_accents_punctuation_and_order(string input, string expected)
    {
        Assert.Equal(expected, PublicSeatingService.NameKey(input));
    }
}
