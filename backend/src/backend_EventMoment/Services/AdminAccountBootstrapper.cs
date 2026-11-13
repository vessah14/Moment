using System.ComponentModel.DataAnnotations;
using backend_EventMoment.Data;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services;

public static class AdminAccountBootstrapper
{
    public static async Task<bool> EnsureInitialSuperadminAsync(
        AdminDbContext context,
        string email,
        string password,
        string fullName,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(email) || !new EmailAddressAttribute().IsValid(email))
            throw new InvalidOperationException("AdminBootstrap:Email doit contenir une adresse e-mail valide.");
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            throw new InvalidOperationException("AdminBootstrap:Password doit contenir au moins 8 caractères.");
        if (string.IsNullOrWhiteSpace(fullName))
            throw new InvalidOperationException("AdminBootstrap:FullName ne peut pas être vide.");

        if (!context.Database.IsNpgsql())
            return await CreateIfMissingAsync(context, email, password, fullName, cancellationToken);

        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        await context.Database.ExecuteSqlRawAsync(
            "DO $$ BEGIN PERFORM pg_advisory_xact_lock(1745329211, 1); END $$;",
            cancellationToken);

        var created = await CreateIfMissingAsync(context, email, password, fullName, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return created;
    }

    private static async Task<bool> CreateIfMissingAsync(
        AdminDbContext context,
        string email,
        string password,
        string fullName,
        CancellationToken cancellationToken)
    {
        if (await context.AdminAccounts.AnyAsync(cancellationToken))
            return false;

        var now = DateTimeOffset.UtcNow;
        context.AdminAccounts.Add(new AdminAccount
        {
            Id = Guid.NewGuid(),
            Email = email.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FullName = fullName.Trim(),
            Role = AdminRole.Superadmin,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now,
        });
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
