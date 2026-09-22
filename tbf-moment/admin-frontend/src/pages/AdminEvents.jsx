import { useMemo, useState } from 'react'
import AdminLayout from '../components/layout/AdminLayout'
import StatusBadge from '../components/ui/StatusBadge'
import { PLATFORM_EVENTS } from '../data/adminData'

export default function AdminEvents() {
  const [events, setEvents] = useState(PLATFORM_EVENTS)
  const [category, setCategory] = useState('Tous')

  const categories = useMemo(
    () => ['Tous', ...new Set(PLATFORM_EVENTS.map((e) => e.category))],
    [],
  )

  const filtered = events.filter(
    (e) => category === 'Tous' || e.category === category,
  )

  const toggleSuspend = (id) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: e.status === 'Suspendu' ? 'Publié' : 'Suspendu' }
          : e,
      ),
    )
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-ink">Événements</h1>
        <p className="mt-1.5 text-sm text-muted">
          {events.length} événements créés sur la plateforme
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              category === cat
                ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                : 'border border-border text-muted hover:border-faint hover:text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border-soft bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-soft text-xs tracking-wider text-faint uppercase">
                <th className="px-6 py-3 font-medium">Événement</th>
                <th className="px-3 py-3 font-medium">Organisation</th>
                <th className="px-3 py-3 font-medium">Catégorie</th>
                <th className="px-3 py-3 font-medium">Invités</th>
                <th className="px-3 py-3 font-medium">Statut</th>
                <th className="w-32 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id} className="border-b border-border-soft last:border-b-0">
                  <td className="px-6 py-4">
                    <p className="font-medium text-ink">{event.name}</p>
                    <p className="text-xs text-faint">{event.date}</p>
                  </td>
                  <td className="px-3 py-4 text-muted">{event.organization}</td>
                  <td className="px-3 py-4 text-muted">{event.category}</td>
                  <td className="px-3 py-4 font-mono text-muted">{event.guests}</td>
                  <td className="px-3 py-4">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      onClick={() => toggleSuspend(event.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        event.status === 'Suspendu'
                          ? 'border-success/40 text-success hover:bg-success/10'
                          : 'border-danger/40 text-danger hover:bg-danger/10'
                      }`}
                    >
                      {event.status === 'Suspendu' ? 'Rétablir' : 'Suspendre'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
