import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ActivityCard from '../../components/program/ActivityCard'
import ActivityDetailPanel from '../../components/program/ActivityDetailPanel'
import ActivityForm from '../../components/program/ActivityForm'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { listEvents } from '../../api/events'
import {
  createProgramItem,
  deleteProgramItem,
  listProgramItems,
  toggleProgramItemNotify,
  updateProgramItem,
} from '../../api/program'

const ROOMS = ['Salle principale', 'Salle B', 'Jardin', 'Terrasse']

function toRow(item) {
  const iso = item.startTime
  return {
    id: item.id,
    date: iso ? iso.slice(0, 10) : '',
    time: iso ? iso.slice(11, 16) : '',
    duration: item.durationMinutes,
    title: item.title,
    location: item.location,
    speaker: item.speaker,
    description: item.description,
    capacity: item.capacity,
    notify: item.notify,
  }
}

export default function Program() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeDate, setActiveDate] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    listEvents()
      .then((data) => {
        setEvents(data ?? [])
        if (data?.length) setSelectedEventId(data[0].id)
        else setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Impossible de charger vos événements.')
        setLoading(false)
      })
  }, [])

  const reload = (eventId) => {
    setLoading(true)
    listProgramItems(eventId)
      .then((data) => {
        const rows = (data ?? []).map(toRow)
        setItems(rows)
        const dates = [...new Set(rows.map((r) => r.date).filter(Boolean))].sort()
        setActiveDate((prev) => (dates.includes(prev) ? prev : dates[0] ?? ''))
        setError('')
      })
      .catch((err) => setError(err.message || 'Impossible de charger le programme.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedEventId) return
    reload(selectedEventId)
  }, [selectedEventId])

  const dates = useMemo(
    () => [...new Set(items.map((r) => r.date).filter(Boolean))].sort(),
    [items],
  )

  const sorted = useMemo(
    () =>
      items
        .filter((a) => a.date === activeDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [items, activeDate],
  )

  const selectedActivity = sorted.find((a) => a.id === selectedId) ?? sorted[0] ?? null

  const handleAdd = async (values) => {
    setError('')
    try {
      await createProgramItem(
        {
          title: values.title,
          description: values.description || null,
          speaker: values.speaker || null,
          location: values.location || null,
          startTime: `${values.date}T${values.time}:00`,
          durationMinutes: values.duration,
          capacity: values.capacity,
        },
        selectedEventId,
      )
      setFormOpen(false)
      setActiveDate(values.date)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'ajout a échoué.")
    }
  }

  const toggleNotify = async (id) => {
    setError('')
    try {
      await toggleProgramItemNotify(id)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'action a échoué.")
    }
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      await deleteProgramItem(id)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || 'La suppression a échoué.')
    }
  }

  const handleQuickSave = async (id, patch) => {
    const current = items.find((a) => a.id === id)
    if (!current) return
    setError('')
    try {
      await updateProgramItem(id, {
        location: patch.location ?? current.location,
        capacity: patch.capacity ?? current.capacity,
        notify: current.notify,
      })
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'enregistrement a échoué.")
    }
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-ink">Programme</h1>
        <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
          Créez d'abord un événement.
        </p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Programme — {selectedEvent?.name ?? ''}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {items.length} activités sur {dates.length || 0} jour(s)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
          <Button variant="gradient" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Ajouter une activité
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {dates.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {dates.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setActiveDate(d)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeDate === d
                  ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                  : 'border border-border text-muted hover:border-faint hover:text-ink'
              }`}
            >
              {new Date(`${d}T00:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {formOpen && (
            <ActivityForm
              date={activeDate || new Date().toISOString().slice(0, 10)}
              onSubmit={handleAdd}
              onCancel={() => setFormOpen(false)}
            />
          )}

          {!loading && sorted.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border-soft py-12 text-center text-sm text-faint">
              Aucune activité ce jour-là. Ajoutez la première étape.
            </p>
          ) : (
            <div>
              {sorted.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  isSelected={activity.id === selectedId}
                  onSelect={setSelectedId}
                  onToggleNotify={toggleNotify}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <ActivityDetailPanel
            key={selectedActivity?.id ?? 'none'}
            activity={selectedActivity}
            rooms={ROOMS}
            onSave={handleQuickSave}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
