import { Bell, BellOff, Trash2, User } from 'lucide-react'

export default function ActivityCard({ activity, isSelected, onSelect, onToggleNotify, onDelete }) {
  return (
    <div className="flex gap-4">
      <div className="flex w-16 shrink-0 flex-col items-center">
        <span className="font-mono text-sm font-semibold text-ink">
          {activity.time}
        </span>
        <span className="mt-0.5 text-[11px] text-faint">{activity.duration} min</span>
        <span className="mt-1 w-px flex-1 bg-border-soft" />
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(activity.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(activity.id)
          }
        }}
        className={`mb-6 flex-1 cursor-pointer rounded-2xl border p-5 text-left transition ${
          isSelected
            ? 'border-brand-purple bg-brand-purple/5'
            : 'border-border-soft bg-surface hover:border-faint'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-ink">{activity.title}</h3>
            {activity.speaker && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-purple">
                <User className="h-3.5 w-3.5" />
                {activity.speaker}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {activity.location && (
              <span className="rounded-full bg-brand-purple/15 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-brand-purple">
                {activity.location}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleNotify(activity.id)
              }}
              title={
                activity.notify
                  ? 'Rappel automatique activé'
                  : 'Rappel automatique désactivé'
              }
              className={`rounded-lg p-2 transition ${
                activity.notify
                  ? 'text-brand-purple hover:bg-brand-purple/10'
                  : 'text-faint hover:bg-surface-2'
              }`}
            >
              {activity.notify ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(activity.id)
              }}
              className="rounded-lg p-2 text-faint transition hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {activity.description && (
          <p className="mt-3 text-sm text-muted">{activity.description}</p>
        )}
      </div>
    </div>
  )
}
