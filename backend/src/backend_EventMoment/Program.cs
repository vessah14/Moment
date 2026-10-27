using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using backend_EventMoment.Data;
using backend_EventMoment.Interfaces;
using backend_EventMoment.Models;
using backend_EventMoment.Services;
using backend_EventMoment.Services.Exceptions;
using backend_EventMoment.Services.Email;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.OpenApi.Models;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.RateLimiting;
using Npgsql;
using Prometheus;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.Grafana.Loki;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, _, logger) =>
{
    logger.MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("service", "moment-api")
        .WriteTo.Console();

    var lokiUrl = context.Configuration["Loki:Url"];
    if (!string.IsNullOrWhiteSpace(lokiUrl))
    {
        logger.WriteTo.GrafanaLoki(lokiUrl,
        [
            new LokiLabel { Key = "service", Value = "moment-api" },
            new LokiLabel { Key = "environment", Value = context.HostingEnvironment.EnvironmentName }
        ]);
    }
});

AdminDbContext.KPayEnabled = builder.Configuration.GetValue("Payments:KPay:Enabled", false);

// Taille maximale d'une requête : 1 Mo (Kestrel autorise 30 Mo par défaut). Évite qu'un
// client remplisse la base avec des champs texte géants. Les endpoints de téléversement
// déclarent leur propre [RequestSizeLimit], qui prend le dessus.
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 1024 * 1024);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database", tags: ["ready"]);
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 1;

    if (builder.Environment.IsDevelopment()
        && builder.Configuration.GetValue("ForwardedHeaders:TrustAllProxiesInDevelopment", false))
    {
        options.KnownNetworks.Clear();
        options.KnownProxies.Clear();
        return;
    }

    // Proxy:KnownProxies (documenté) ; ForwardedHeaders:KnownProxies reste lu pour les
    // configurations existantes.
    var proxies = (builder.Configuration.GetSection("Proxy:KnownProxies").Get<string[]>() ?? [])
        .Concat(builder.Configuration.GetSection("ForwardedHeaders:KnownProxies").Get<string[]>() ?? []);
    foreach (var proxy in proxies)
    {
        if (System.Net.IPAddress.TryParse(proxy, out var address))
            options.KnownProxies.Add(address);
    }
});
// Nombre de requêtes par minute et par IP (RateLimits:<Nom> pour l'ajuster, ex. tests).
// Les opérateurs mobiles font sortir beaucoup d'abonnés par la même IP (CGNAT) : les quotas
// publics doivent laisser répondre toute une famille du même réseau en même temps.
int Limit(string name, int fallback) => builder.Configuration.GetValue($"RateLimits:{name}", fallback);

// Adresse du visiteur pour les quotas. Derrière Cloudflare et un hébergeur (Render…), le
// dernier proxy a une IP interne qui change : Proxy:ClientIpHeader (ex. CF-Connecting-IP)
// désigne l'en-tête posé par le proxy de bord. À ne régler que si l'API n'est joignable
// qu'à travers ce proxy, sinon un client pourrait choisir son adresse.
var clientIpHeader = builder.Configuration["Proxy:ClientIpHeader"];
string ClientIp(HttpContext context)
{
    if (!string.IsNullOrWhiteSpace(clientIpHeader)
        && System.Net.IPAddress.TryParse(context.Request.Headers[clientIpHeader].ToString().Trim(), out var fromHeader))
        return fromHeader.ToString();
    return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    // Message lisible (sinon le site n'affiche que « Erreur 429 »).
    options.OnRejected = async (context, ct) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { error = "Trop de tentatives. Patientez une minute avant de réessayer." }, ct);
    };
    // Le blocage par compte (LoginThrottle) protège chaque mot de passe ; ce quota par IP ne
    // freine que les essais en masse, sans bloquer tout un réseau mobile.
    options.AddPolicy("login", context => RateLimitPartition.GetFixedWindowLimiter(
        ClientIp(context),
        _ => new FixedWindowRateLimiterOptions { PermitLimit = Limit("Login", 15), Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    options.AddPolicy("public-write", context => RateLimitPartition.GetFixedWindowLimiter(
        ClientIp(context),
        _ => new FixedWindowRateLimiterOptions { PermitLimit = Limit("PublicWrite", 40), Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    // Compteurs de visites/partages : quota séparé pour ne pas consommer celui des RSVP.
    options.AddPolicy("public-track", context => RateLimitPartition.GetFixedWindowLimiter(
        ClientIp(context),
        _ => new FixedWindowRateLimiterOptions { PermitLimit = Limit("PublicTrack", 120), Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    // Consultation publique (sites d'événements, invitations, cadeaux, sitemap) : large pour
    // un visiteur, mais freine l'aspiration massive des données et la surcharge.
    options.AddPolicy("public-browse", context => RateLimitPartition.GetFixedWindowLimiter(
        ClientIp(context),
        _ => new FixedWindowRateLimiterOptions { PermitLimit = Limit("PublicBrowse", 400), Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    // Lectures publiques sensibles (ex. « Trouver ma place ») : freine l'énumération de noms.
    options.AddPolicy("public-read", context => RateLimitPartition.GetFixedWindowLimiter(
        ClientIp(context),
        _ => new FixedWindowRateLimiterOptions { PermitLimit = Limit("PublicRead", 60), Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
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
// RLS : chaque connexion indique à PostgreSQL l'organisateur concerné (voir RlsSessionInterceptor).
builder.Services.AddScoped<RlsBypass>();
builder.Services.AddDbContext<AdminDbContext>((sp, options) =>
    options.UseNpgsql(adminDataSource)
        .AddInterceptors(new RlsSessionInterceptor(
            sp.GetRequiredService<IHttpContextAccessor>(), sp.GetRequiredService<RlsBypass>())));

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

// Blocage des comptes après trop d'échecs de connexion et sessions révoquées (déconnexion).
builder.Services.AddMemoryCache();
// Clés de chiffrement des secrets de double authentification admin : conservées sur disque
// (hors base de données) pour survivre aux redémarrages. Sans elles, les admins devraient
// reconfigurer leur application. DataProtection:KeysPath pour choisir le dossier.
builder.Services.AddDataProtection()
    .SetApplicationName("tbf-moment")
    .PersistKeysToFileSystem(new DirectoryInfo(
        builder.Configuration["DataProtection:KeysPath"] ?? Path.Combine(builder.Environment.ContentRootPath, "keys")));
builder.Services.AddSingleton<LoginThrottle>();
builder.Services.AddSingleton<SessionRevocations>();
builder.Services.AddScoped<IAdminAccountService, AdminAccountService>();
builder.Services.AddScoped<IAdminPlatformService, AdminPlatformService>();
builder.Services.AddScoped<IAdminTelemetryService, AdminTelemetryService>();
builder.Services.AddHostedService<AdminTelemetryRetentionService>();
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
builder.Services.AddScoped<IKPayPaymentService, KPayPaymentService>();
builder.Services.AddScoped<IFacebookAuthService, FacebookAuthService>();
builder.Services.AddScoped<IGoogleAuthService, GoogleAuthService>();
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
// Liens d'invitation envoyés automatiquement aux invités ajoutés (voir GuestService).
builder.Services.AddSingleton<InvitationSignal>();
builder.Services.AddHostedService<InvitationDispatcher>();
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

            // Session fermée par « Se déconnecter ».
            var revocations = context.HttpContext.RequestServices.GetRequiredService<SessionRevocations>();
            if (revocations.IsRevoked(context.Principal?.FindFirst("jti")?.Value))
            {
                context.Fail("Session fermée.");
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

// Derrière un proxy (nginx, hébergeur) : sans ceci, toutes les requêtes semblent venir du
// proxy et les limites par IP (connexion, formulaires publics) s'appliqueraient à tout le
// site d'un coup. Seuls les proxys de confiance sont crus : la boucle locale par défaut,
// plus les adresses de Proxy:KnownProxies — un X-Forwarded-For venu d'Internet est ignoré.
// Réglages : Configure<ForwardedHeadersOptions> plus haut (un seul passage).
app.UseForwardedHeaders();
app.UseWhen(context =>
    HttpMethods.IsGet(context.Request.Method)
    && (context.Request.Path == "/sitemap-events.xml"
        || (context.Request.Path.StartsWithSegments("/api/public/events")
            && context.Request.Path.Value?.EndsWith("/site", StringComparison.OrdinalIgnoreCase) == true)),
    branch => branch.UseResponseCompression());

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;

        var (statusCode, message) = exception switch
        {
            KeyNotFoundException => (StatusCodes.Status404NotFound, exception.Message),
            IdempotencyConflictException => (StatusCodes.Status409Conflict, exception.Message),
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

app.UseHttpMetrics();
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
app.Use(async (context, next) =>
{
    var isAdminApi = context.Request.Path.StartsWithSegments("/api/admin");
    var isApiRequest = context.Request.Path.StartsWithSegments("/api");
    var isMutation = !HttpMethods.IsGet(context.Request.Method)
        && !HttpMethods.IsHead(context.Request.Method)
        && !HttpMethods.IsOptions(context.Request.Method);
    var isSuperadmin = context.User.Identity?.IsAuthenticated == true
        && context.User.IsInRole(AdminRole.Superadmin.ToString());
    var route = context.Request.Path.Value ?? "/";
    if (route.Length > 300)
        route = route[..300];

    try
    {
        await next();
    }
    catch (Exception exception)
    {
        var (statusCode, category) = exception switch
        {
            DbUpdateException => (StatusCodes.Status409Conflict, "Conflit de données"),
            IdempotencyConflictException => (StatusCodes.Status409Conflict, "Conflit de données"),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Ressource introuvable"),
            InvalidOperationException => (StatusCodes.Status400BadRequest, "Requête invalide"),
            BadHttpRequestException bad => (bad.StatusCode, "Requête invalide"),
            _ => (StatusCodes.Status500InternalServerError, "Erreur interne")
        };
        if (statusCode == StatusCodes.Status409Conflict || statusCode >= 500)
        {
            try
            {
                await context.RequestServices.GetRequiredService<IAdminTelemetryService>()
                    .RecordTechnicalErrorAsync(category, route, statusCode, CancellationToken.None);
            }
            catch (Exception loggingException)
            {
                context.RequestServices.GetRequiredService<ILogger<Program>>()
                    .LogError(loggingException, "Impossible d'enregistrer l'erreur technique pour {Path}", route);
            }
        }

        throw;
    }

    if (isAdminApi && isMutation && isSuperadmin && context.Response.StatusCode is >= 200 and < 400)
    {
        var adminId = Guid.TryParse(context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : (Guid?)null;
        var email = context.User.FindFirst(ClaimTypes.Email)?.Value
            ?? context.User.Identity?.Name
            ?? "administrateur";
        try
        {
            await context.RequestServices.GetRequiredService<IAdminTelemetryService>()
                .RecordActivityAsync(adminId, email, context.Request.Method, route, CancellationToken.None);
        }
        catch (Exception loggingException)
        {
            context.RequestServices.GetRequiredService<ILogger<Program>>()
                .LogError(loggingException, "Impossible d'enregistrer l'activité admin pour {Path}", route);
        }
    }

    if (isApiRequest && context.Response.StatusCode is 409 or >= 500)
    {
        var category = context.Response.StatusCode == 409 ? "Conflit de données" : "Erreur interne";
        try
        {
            await context.RequestServices.GetRequiredService<IAdminTelemetryService>()
                .RecordTechnicalErrorAsync(category, route, context.Response.StatusCode, CancellationToken.None);
        }
        catch (Exception loggingException)
        {
            context.RequestServices.GetRequiredService<ILogger<Program>>()
                .LogError(loggingException, "Impossible d'enregistrer l'erreur technique pour {Path}", route);
        }
    }
});
app.MapControllers();
// Métriques Prometheus (routes appelées, volumes, connexions à la base, mémoire) : jamais
// publiques. En développement (Docker local), Prometheus les lit directement ; ailleurs,
// elles n'existent que si Metrics:Token est défini, à envoyer en « Authorization: Bearer … ».
var metricsToken = app.Configuration["Metrics:Token"];
if (!string.IsNullOrEmpty(metricsToken))
{
    var expected = System.Text.Encoding.UTF8.GetBytes("Bearer " + metricsToken);
    app.UseWhen(context => context.Request.Path.StartsWithSegments("/metrics"), branch => branch.Use(async (context, next) =>
    {
        var given = System.Text.Encoding.UTF8.GetBytes(context.Request.Headers.Authorization.ToString());
        if (!System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(given, expected))
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }
        await next();
    }));
}
if (app.Environment.IsDevelopment() || !string.IsNullOrEmpty(metricsToken))
    app.MapMetrics("/metrics").AllowAnonymous();
app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false
}).AllowAnonymous();
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
}).AllowAnonymous();

app.Run();

// Vrai si l'exception vient de notre code (services, contrôleurs) et non du framework.
static bool IsOwnException(Exception exception) =>
    exception.TargetSite?.DeclaringType?.Namespace?.StartsWith("backend_EventMoment", StringComparison.Ordinal) == true;
