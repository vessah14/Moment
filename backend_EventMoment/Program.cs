using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using backend_EventMoment.Data;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using backend_EventMoment.Services.Email;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.RateLimiting;
using Npgsql;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Taille maximale d'une requête : 1 Mo (Kestrel autorise 30 Mo par défaut). Évite qu'un
// client remplisse la base avec des champs texte géants. Les endpoints de téléversement
// déclarent leur propre [RequestSizeLimit], qui prend le dessus.
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 1024 * 1024);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("login", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    options.AddPolicy("public-write", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    // Lectures publiques sensibles (ex. « Trouver ma place ») : freine l'énumération de noms.
    options.AddPolicy("public-read", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 30, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:5174" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EventMoment API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Entrez uniquement le token, sans le mot 'Bearer' devant."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// -----------------------------------------------------------------
// Configuration PostgreSQL — TROIS connexions distinctes, une par rôle
// -----------------------------------------------------------------

string GetRequiredConnectionString(string name)
{
    var value = builder.Configuration.GetConnectionString(name);
    if (string.IsNullOrWhiteSpace(value))
        throw new InvalidOperationException($"La chaîne de connexion '{name}' est absente.");
    return value;
}

NpgsqlDataSource BuildDataSource(string connectionString)
{
    var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
    dataSourceBuilder.MapEnum<EventStatus>("event_status");
    dataSourceBuilder.MapEnum<GuestStatus>("guest_status");
    dataSourceBuilder.MapEnum<PlanBilling>("plan_billing");
    dataSourceBuilder.MapEnum<SubscriptionStatus>("subscription_status");
    dataSourceBuilder.MapEnum<AdminRole>("admin_role");
    // block_type est une colonne text libre en base (pas un enum PostgreSQL) —
    // voir Models/Event_blocks.cs.
    return dataSourceBuilder.Build();
}

// AdminDbContext → rôle app_admin
var adminConnString = GetRequiredConnectionString("AdminConnection");
var adminDataSource = BuildDataSource(adminConnString);
builder.Services.AddDbContext<AdminDbContext>(options =>
    options.UseNpgsql(adminDataSource));

// ClientDbContext → rôle app_client
var clientConnString = GetRequiredConnectionString("ClientConnection");
var clientDataSource = BuildDataSource(clientConnString);
builder.Services.AddDbContext<ClientDbContext>(options =>
    options.UseNpgsql(clientDataSource));

// SignupDbContext → rôle app_signup (inscription publique uniquement)
var signupConnString = GetRequiredConnectionString("SignupConnection");
builder.Services.AddDbContext<SignupDbContext>(options =>
    options.UseNpgsql(signupConnString));

// -----------------------------------------------------------------

builder.Services.AddScoped<IAdminAccountService, AdminAccountService>();
builder.Services.AddScoped<IAdminPlatformService, AdminPlatformService>();
builder.Services.AddScoped<IPublicSiteService, PublicSiteService>();
builder.Services.AddScoped<IPublicSeatingService, PublicSeatingService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IEventCategoryService, EventCategoryService>();
builder.Services.AddScoped<IEventLocationService, EventLocationService>();
builder.Services.AddScoped<IEventBlockService, EventBlockService>();
builder.Services.AddScoped<IEventStatsService, EventStatsService>();
builder.Services.AddScoped<IGuestBookService, GuestBookService>();
builder.Services.AddScoped<ISeatingService, SeatingService>();
builder.Services.AddScoped<IGiftRegistryService, GiftRegistryService>();
builder.Services.AddScoped<ITicketingService, TicketingService>();
builder.Services.AddScoped<IConferenceService, ConferenceService>();
builder.Services.AddScoped<IProgramService, ProgramService>();
builder.Services.AddScoped<ICampaignService, CampaignService>();
builder.Services.AddScoped<IGalleryService, GalleryService>();
builder.Services.AddScoped<IGuestService, GuestService>();
builder.Services.AddScoped<IPlanService, PlanService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IGuestGroupService, GuestGroupService>();
builder.Services.AddScoped<IRsvpService, RsvpService>();
builder.Services.AddScoped<ISubscriptionPlanService, SubscriptionPlanService>();
builder.Services.AddScoped<IUserSubscriptionService, UserSubscriptionService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IFacebookAuthService, FacebookAuthService>();
builder.Services.AddHttpClient<BrevoEmailSender>();
builder.Services.AddScoped<SmtpEmailSender>();
builder.Services.AddScoped<IEmailSender>(services =>
    string.IsNullOrWhiteSpace(builder.Configuration["Brevo:ApiKey"])
        ? services.GetRequiredService<SmtpEmailSender>()
        : services.GetRequiredService<BrevoEmailSender>());
builder.Services.AddSingleton<LocalUploadStorage>();
var cloudinaryOptions = CloudinaryOptions.FromConfiguration(builder.Configuration);
if (cloudinaryOptions is null)
{
    builder.Services.AddSingleton<IUploadStorage>(services => services.GetRequiredService<LocalUploadStorage>());
}
else
{
    builder.Services.AddSingleton(cloudinaryOptions);
    builder.Services.AddSingleton<IUploadStorage, CloudinaryUploadStorage>();
}
builder.Services.AddScoped<INotificationSettingsService, NotificationSettingsService>();
builder.Services.AddScoped<IEventReminderService, EventReminderService>();
builder.Services.AddScoped<IOrganizerNotifier, OrganizerNotifier>();
builder.Services.AddHostedService<ReminderDispatcher>();
builder.Services.AddScoped<JwtService>();

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
    throw new InvalidOperationException("Jwt:Key est obligatoire. Configurez-la via User Secrets ou une variable d'environnement.");
// HMAC-SHA256 : une clé courte se casse par force brute et permet de forger des jetons.
if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
    throw new InvalidOperationException("Jwt:Key doit faire au moins 32 octets.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var userId = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var sessionVersion = context.Principal?.FindFirst("session_version")?.Value;
            var accountType = context.Principal?.FindFirst("type")?.Value;

            if (!Guid.TryParse(userId, out var id) || !long.TryParse(sessionVersion, out var version))
            {
                context.Fail("Jeton invalide.");
                return;
            }

            var db = context.HttpContext.RequestServices.GetRequiredService<AdminDbContext>();
            DateTimeOffset? currentUpdatedAt = accountType switch
            {
                "organizer" => await db.Organizers.IgnoreQueryFilters()
                    .Where(u => u.Id == id && u.IsActive)
                    .Select(u => (DateTimeOffset?)u.UpdatedAt)
                    .FirstOrDefaultAsync(),
                "admin" => await db.AdminAccounts
                    .Where(a => a.Id == id && a.IsActive)
                    .Select(a => (DateTimeOffset?)a.UpdatedAt)
                    .FirstOrDefaultAsync(),
                _ => null
            };

            if (currentUpdatedAt?.ToUnixTimeMilliseconds() != version)
                context.Fail("Jeton révoqué ou compte inactif.");
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SuperadminOnly", policy =>
        policy.RequireClaim(ClaimTypes.Role, AdminRole.Superadmin.ToString()));
});

var app = builder.Build();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;

        var (statusCode, message) = exception switch
        {
            KeyNotFoundException => (StatusCodes.Status404NotFound, exception.Message),
            // Messages métier de nos services uniquement : une InvalidOperationException levée
            // par le framework (EF, sérialisation…) contient des détails techniques internes.
            InvalidOperationException when IsOwnException(exception) => (StatusCodes.Status400BadRequest, exception.Message),
            InvalidOperationException => (StatusCodes.Status400BadRequest, "Requête invalide."),
            DbUpdateException => (StatusCodes.Status409Conflict, "Conflit de données : l'opération n'a pas pu être effectuée."),
            // Requête trop volumineuse (limite Kestrel), corps illisible... : erreur du client.
            BadHttpRequestException bad => (bad.StatusCode, bad.StatusCode == StatusCodes.Status413PayloadTooLarge
                ? "Requête trop volumineuse."
                : "Requête invalide."),
            _ => (StatusCodes.Status500InternalServerError, "Une erreur interne est survenue.")
        };

        if (statusCode == StatusCodes.Status500InternalServerError && exception != null)
        {
            context.RequestServices.GetRequiredService<ILogger<Program>>()
                .LogError(exception, "Erreur non gérée lors du traitement de la requête {Path}", context.Request.Path);
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { error = message });
    });
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Force HTTPS côté navigateur (le jeton de session ne doit jamais circuler en clair).
    app.UseHsts();
}

app.Use(async (context, next) =>
{
    // En-têtes de sécurité de base. nosniff est essentiel pour /uploads : sans lui, un
    // navigateur peut "deviner" qu'un fichier .png contient du HTML et l'exécuter.
    var headers = context.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});

app.UseHttpsRedirection();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Les fichiers téléversés ne doivent jamais pouvoir exécuter de script.
        if (ctx.Context.Request.Path.StartsWithSegments("/uploads"))
            ctx.Context.Response.Headers["Content-Security-Policy"] = "default-src 'none'; img-src 'self'; sandbox";
    }
});
app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Vrai si l'exception vient de notre code (services, contrôleurs) et non du framework.
static bool IsOwnException(Exception exception) =>
    exception.TargetSite?.DeclaringType?.Namespace?.StartsWith("backend_EventMoment", StringComparison.Ordinal) == true;
