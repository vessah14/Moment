import { Trash2 } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import { formatFcfa } from '../../utils/formatCurrency'

const STATUS_LABELS = {
  available: 'Disponible',
  reserved: 'Réservé',
  given: 'Offert',
}

export default function GiftCard({ gift, onDelete, footer }) {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-xs text-faint">
          Photo
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(gift.id)}
            className="rounded-lg p-1.5 text-faint transition hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <h3 className="mt-3 font-semibold text-ink">{gift.name}</h3>
      <p className="mt-1 text-sm text-muted">{gift.description}</p>
      <p className="mt-2 font-mono text-sm font-semibold text-ink">
        {formatFcfa(gift.price)}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <StatusBadge status={STATUS_LABELS[gift.status]} />
        {gift.reservedBy && (
          <span className="text-xs text-faint">par {gift.reservedBy}</span>
        )}
      </div>

      {footer}
    </div>
  )
}
