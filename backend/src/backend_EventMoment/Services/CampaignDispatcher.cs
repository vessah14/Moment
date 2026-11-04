using System.Threading.Channels;
using backend_EventMoment.Data;
using backend_EventMoment.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_EventMoment.Services
{
    // File des campagnes e-mail à envoyer en arrière-plan (grandes listes d'invités) : la
    // requête de l'organisateur répond tout de suite, l'envoi se fait ici.
    public sealed class CampaignQueue
    {
        private readonly Channel<Guid> _channel = Channel.CreateUnbounded<Guid>(new UnboundedChannelOptions { SingleReader = true });

        public void Enqueue(Guid campaignId) => _channel.Writer.TryWrite(campaignId);

        public IAsyncEnumerable<Guid> ReadAllAsync(CancellationToken ct) => _channel.Reader.ReadAllAsync(ct);
    }

    public sealed class CampaignDispatcher : BackgroundService
    {
        private readonly CampaignQueue _queue;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<CampaignDispatcher> _logger;

        public CampaignDispatcher(CampaignQueue queue, IServiceScopeFactory scopeFactory, ILogger<CampaignDispatcher> logger)
        {
            _queue = queue;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await RecoverInterruptedAsync(stoppingToken);
            await foreach (var id in _queue.ReadAllAsync(stoppingToken))
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    await scope.ServiceProvider.GetRequiredService<CampaignService>().SendQueuedAsync(id, stoppingToken);
                }
                catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogError(ex, "Envoi en arrière-plan de la campagne {CampaignId} échoué", id);
                }
            }
        }

        // Redémarrage du serveur pendant un envoi : sans suivi par destinataire, on ne relance
        // pas (risque de doublons). La campagne repasse en brouillon et l'organisateur est
        // prévenu pour la renvoyer.
        private async Task RecoverInterruptedAsync(CancellationToken ct)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
                var stuck = await db.MessageCampaigns.IgnoreQueryFilters()
                    .Where(c => c.Status == CampaignStatus.EnCours)
                    .ToListAsync(ct);
                if (stuck.Count == 0) return;
                var notifications = scope.ServiceProvider.GetRequiredService<Interfaces.IInAppNotificationService>();
                foreach (var campaign in stuck) campaign.Status = CampaignStatus.Brouillon;
                await db.SaveChangesAsync(ct);
                foreach (var campaign in stuck)
                    await notifications.NotifyCampaignSentAsync(campaign.EventId, campaign.Subject ?? "Campagne", 0, campaign.RecipientCount,
                        "l'envoi a été interrompu par un redémarrage du serveur. Vérifiez avec vos invités puis renvoyez-la si besoin.");
            }
            catch (Exception ex) when (!ct.IsCancellationRequested)
            {
                _logger.LogWarning(ex, "Reprise des campagnes interrompues impossible");
            }
        }
    }
}
