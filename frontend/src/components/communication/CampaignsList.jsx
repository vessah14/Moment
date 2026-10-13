import { Pencil, Trash2 } from 'lucide-react'
import { CHANNELS } from '../../data/communicationChannels'
import Pagination from '../ui/Pagination'
import StatusBadge from '../ui/StatusBadge'
import { usePagination } from '../../utils/pagination'

const STATUS_LABELS = { Brouillon: 'Brouillon', Programmee: 'Programmée', Envoyee: 'Envoyée' }

function channelIcon(channel) {
  return CHANNELS.find((c) => c.value === channel)?.icon
}

// 5 campagnes par page ; retour à la première page quand la liste change (filtre, nouvel envoi).
const PAGE_SIZE = 5

export default function CampaignsList({ campaigns, onEdit, onDelete }) {
  const pagination = usePagination(campaigns, 'tbf_page_size_campaigns', `${campaigns.length}:${campaigns[0]?.id ?? ''}`, PAGE_SIZE)

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
              <th className="w-20 px-3 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.map((c) => {
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
                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-1">
                      {/* Une campagne envoyée ne se modifie plus : les messages sont partis. */}
                      {c.status !== 'Envoyee' && (
                        <button
                          type="button"
                          onClick={() => onEdit?.(c)}
                          title="Modifier"
                          aria-label={`Modifier la campagne ${c.name}`}
                          className="rounded-lg p-2 text-faint transition hover:bg-surface-2 hover:text-brand-purple"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete?.(c)}
                        title="Supprimer"
                        aria-label={`Supprimer la campagne ${c.name}`}
                        className="rounded-lg p-2 text-faint transition hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {pagination.pageCount > 1 && (
        <div className="border-t border-border-soft px-6 py-3">
          <Pagination pagination={pagination} label="campagnes" />
        </div>
      )}
    </div>
  )
}
