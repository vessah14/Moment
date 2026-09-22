import { Link } from 'react-router-dom'
import StatusBadge from '../ui/StatusBadge'

export default function EventCard({
  name,
  status,
  category,
  date,
  location,
  progressLabel,
  confirmed,
  total,
  barColor,
  actions,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface">
      <div className="relative aspect-video bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-panel))]">
        <span className="absolute top-3 left-3">
          <StatusBadge status={status} />
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-ink">{name}</h3>
        <p className="mt-1 text-sm text-faint">
          {category} · {date} · {location}
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-faint">
            <span>{progressLabel}</span>
            <span className="font-mono text-ink">
              {total ? `${confirmed}/${total}` : '—'}
            </span>
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-border-soft">
            <div
              className={`h-full rounded-full ${barColor}`}
              style={{ width: `${total ? (confirmed / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          {actions.map((action) =>
            action.to ? (
              <Link
                key={action.label}
                to={action.to}
                className={`flex-1 rounded-lg border px-3 py-2 text-center text-xs font-medium transition ${
                  action.highlight
                    ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                    : 'border-border text-muted hover:border-faint hover:text-ink'
                }`}
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`flex-1 rounded-lg border px-3 py-2 text-center text-xs font-medium transition ${
                  action.danger
                    ? 'border-danger/40 text-danger hover:bg-danger/10'
                    : action.highlight
                      ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                      : 'border-border text-muted hover:border-faint hover:text-ink'
                }`}
              >
                {action.label}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
