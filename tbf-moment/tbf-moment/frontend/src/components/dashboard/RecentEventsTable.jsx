import { Link } from 'react-router-dom'
import StatusBadge from '../ui/StatusBadge'
import { formatEventDate, statusLabel } from '../../utils/eventStatus'

export default function RecentEventsTable({ events, loading }) {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="font-semibold text-ink">Événements récents</h2>
        <Link
          to="/dashboard/evenements"
          className="text-sm text-brand-purple hover:underline"
        >
          Tout voir
        </Link>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-y border-border-soft text-xs tracking-wider text-faint uppercase">
            <th className="px-6 py-3 font-medium">Événement</th>
            <th className="px-6 py-3 font-medium">Date</th>
            <th className="px-6 py-3 font-medium">RSVP</th>
            <th className="px-6 py-3 font-medium">Statut</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-sm text-faint">
                Chargement…
              </td>
            </tr>
          )}
          {!loading && events.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-sm text-faint">
                Aucun événement pour le moment.
              </td>
            </tr>
          )}
          {!loading &&
            events.map((event) => (
              <tr key={event.id} className="border-b border-border-soft last:border-b-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-surface-2" />
                    <div>
                      <p className="font-medium text-ink">{event.name}</p>
                      <p className="text-xs text-faint">{event.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted">{formatEventDate(event.date)}</td>
                <td className="px-6 py-4">
                  <p className="font-mono text-ink">
                    {event.total ? `${event.confirmed}/${event.total}` : '—'}
                  </p>
                  <div className="mt-1.5 h-1 w-24 rounded-full bg-border-soft">
                    <div
                      className="h-full rounded-full bg-success"
                      style={{
                        width: `${event.total ? (event.confirmed / event.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={statusLabel(event.status)} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
