import { Bell, BellOff, MapPin, Trash2, User } from 'lucide-react'

export default function ActivityCard({ activity, onToggleNotify, onDelete }) {
  return (
    <div className="flex gap-4">
      <div className="flex w-16 shrink-0 flex-col items-center">
        <span className="font-mono text-sm font-semibold text-ink">
          {activity.time}
        </span>
        <span className="mt-1 w-px flex-1 bg-border-soft" />
      </div>

      <div className="mb-6 flex-1 rounded-2xl border border-border-soft bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-ink">{activity.title}</h3>
            {activity.location && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-faint">
                <MapPin className="h-3.5 w-3.5" />
                {activity.location}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleNotify(activity.id)}
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
              onClick={() => onDelete(activity.id)}
              className="rounded-lg p-2 text-faint transition hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {activity.description && (
          <p className="mt-3 text-sm text-muted">{activity.description}</p>
        )}

        {activity.speaker && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-brand-purple">
            <User className="h-3.5 w-3.5" />
            {activity.speaker}
          </p>
        )}
      </div>
    </div>
  )
}
