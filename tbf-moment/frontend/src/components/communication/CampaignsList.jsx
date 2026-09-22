import { CHANNELS } from '../../data/communicationChannels'
import StatusBadge from '../ui/StatusBadge'

const STATUS_LABELS = { Brouillon: 'Brouillon', Programmee: 'Programmée', Envoyee: 'Envoyée' }

function channelIcon(channel) {
  return CHANNELS.find((c) => c.value === channel)?.icon
}

export default function CampaignsList({ campaigns }) {
  if (campaigns.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border-soft py-12 text-center text-sm text-faint">
        Aucune campagne pour l'instant.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border-soft text-xs tracking-wider text-faint uppercase">
              <th className="px-6 py-3 font-medium">Campagne</th>
              <th className="px-3 py-3 font-medium">Canal</th>
              <th className="px-3 py-3 font-medium">Audience</th>
              <th className="px-3 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Statut</th>
              <th className="px-3 py-3 font-medium">Destinataires</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const Icon = channelIcon(c.channel)
              return (
                <tr key={c.id} className="border-b border-border-soft last:border-b-0">
                  <td className="px-6 py-4 font-medium text-ink">{c.name}</td>
                  <td className="px-3 py-4">
                    <span className="flex items-center gap-1.5 text-muted">
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {c.channel}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-muted">{c.audience}</td>
                  <td className="px-3 py-4 font-mono text-xs text-muted">
                    {new Date(c.sentAt ?? c.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-3 py-4">
                    <StatusBadge status={STATUS_LABELS[c.status] ?? c.status} />
                  </td>
                  <td className="px-3 py-4 font-mono text-xs text-muted">{c.recipientCount}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
