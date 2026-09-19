import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EventCard from '../../components/events/EventCard'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { INITIAL_EVENTS } from '../../data/myEvents'
import { useLocalStorageState } from '../../utils/useLocalStorageState'

const FILTERS = ['Tous', 'Publiés', 'Brouillons', 'Passés']

export default function MyEvents() {
  const navigate = useNavigate()
  const [events, setEvents] = useLocalStorageState('tbf_myevents', INITIAL_EVENTS)
  const [archivedEvents, setArchivedEvents] = useState([])
  const [filter, setFilter] = useState('Tous')
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const matchesFilter =
        filter === 'Tous' ||
        (filter === 'Publiés' && event.status === 'Publié') ||
        (filter === 'Brouillons' && event.status === 'Brouillon')
      const matchesQuery = event.name.toLowerCase().includes(query.toLowerCase())
      return matchesFilter && matchesQuery
    })
  }, [events, filter, query])

  const handlePublish = (id) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'Publié' } : e)),
    )
  }

  const handleArchive = (id) => {
    setEvents((prev) => {
      const target = prev.find((e) => e.id === id)
      if (target) setArchivedEvents((archived) => [...archived, target])
      return prev.filter((e) => e.id !== id)
    })
  }

  const handleRestore = (id) => {
    setArchivedEvents((prev) => {
      const target = prev.find((e) => e.id === id)
      if (target) setEvents((events) => [...events, target])
      return prev.filter((e) => e.id !== id)
    })
  }

  const handleDuplicate = (id) => {
    setEvents((prev) => {
      const source = prev.find((e) => e.id === id)
      if (!source) return prev
      const copy = {
        ...source,
        id: `${source.id}-copie-${Date.now()}`,
        name: `${source.name} (copie)`,
        status: 'Brouillon',
      }
      return [...prev, copy]
    })
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Mes événements</h1>
          <p className="mt-1.5 text-muted">
            {events.filter((e) => e.status === 'Publié').length} actifs ·{' '}
            {events.filter((e) => e.status === 'Brouillon').length} brouillon(s)
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowArchived((v) => !v)}>
            {showArchived ? 'Voir les actifs' : `Archives (${archivedEvents.length})`}
          </Button>
          <Button as={Link} to="/dashboard/evenements/nouveau" variant="gradient">
            Nouvel événement
          </Button>
        </div>
      </div>

      {!showArchived && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher"
                className="w-48 rounded-lg border border-border bg-surface py-2.5 pr-4 pl-10 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
              />
            </div>
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === f
                    ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                    : 'border border-border text-muted hover:border-faint hover:text-ink'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="outline">Catégorie</Button>
        </div>
      )}

      {showArchived ? (
        archivedEvents.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
            Aucun événement archivé.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {archivedEvents.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                actions={[
                  {
                    label: 'Restaurer',
                    highlight: true,
                    onClick: () => handleRestore(event.id),
                  },
                ]}
              />
            ))}
          </div>
        )
      ) : (
        <>
          {filtered.length === 0 && (
            <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
              Aucun événement dans « {filter} ».
            </p>
          )}

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                actions={
                  event.status === 'Brouillon'
                    ? [
                        { label: 'Modifier', to: '/dashboard/evenements/nouveau' },
                        { label: 'Dupliquer', onClick: () => handleDuplicate(event.id) },
                        {
                          label: 'Publier',
                          highlight: true,
                          onClick: () => handlePublish(event.id),
                        },
                      ]
                    : [
                        { label: 'Modifier', to: '/dashboard/evenements/nouveau' },
                        {
                          label: 'Archiver',
                          danger: true,
                          onClick: () => handleArchive(event.id),
                        },
                        {
                          label: 'Voir',
                          onClick: () =>
                            navigate('/builder', { state: { event } }),
                        },
                      ]
                }
              />
            ))}

            <Link
              to="/dashboard/evenements/nouveau"
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-10 text-center transition hover:border-faint"
            >
              <span className="h-10 w-10 rounded-xl bg-surface-2" />
              <span className="font-semibold text-ink">Créer un événement</span>
              <span className="text-xs text-faint">
                Il vous reste 1 événement sur le plan Free
              </span>
            </Link>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
