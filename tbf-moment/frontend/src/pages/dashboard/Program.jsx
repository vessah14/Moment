import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import ActivityCard from '../../components/program/ActivityCard'
import ActivityDetailPanel from '../../components/program/ActivityDetailPanel'
import ActivityForm from '../../components/program/ActivityForm'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'

const ROOMS = [
  'Grande mosquée · Dakar',
  'Jardins de la mosquée',
  'Salle Teranga · Almadies',
  'Villa familiale · Almadies',
]

const DAYS = [
  { value: 1, label: 'Jour 1 (13 Mars)' },
  { value: 2, label: 'Jour 2 (14 Mars)' },
  { value: 3, label: 'Jour 3 (15 Mars)' },
]

const INITIAL_ACTIVITIES = [
  {
    id: 1,
    day: 1,
    time: '10:00',
    duration: 90,
    title: 'Henné & remise des cadeaux',
    location: ROOMS[3],
    description: 'Rituel du henné entre les deux familles.',
    capacity: 40,
    notify: false,
  },
  {
    id: 2,
    day: 2,
    time: '14:00',
    duration: 60,
    title: 'Accueil des invités',
    location: ROOMS[0],
    description: 'Installation et remise des programmes.',
    capacity: 200,
    notify: true,
  },
  {
    id: 3,
    day: 2,
    time: '16:00',
    duration: 90,
    title: 'Cérémonie religieuse',
    location: ROOMS[0],
    speaker: 'Imam Alioune Sarr',
    description: "Bénédiction et échange des vœux.",
    capacity: 200,
    notify: true,
  },
  {
    id: 4,
    day: 2,
    time: '18:30',
    duration: 60,
    title: 'Séance photo',
    location: ROOMS[1],
    capacity: 30,
    notify: false,
  },
  {
    id: 5,
    day: 2,
    time: '20:00',
    duration: 180,
    title: 'Réception et dîner',
    location: ROOMS[2],
    description: 'Discours, dîner et ouverture de la piste de danse.',
    capacity: 250,
    notify: true,
  },
  {
    id: 6,
    day: 3,
    time: '11:00',
    duration: 120,
    title: 'Brunch de remerciement',
    location: ROOMS[2],
    description: 'Moment convivial pour remercier les proches.',
    capacity: 80,
    notify: true,
  },
]

export default function Program() {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES)
  const [activeDay, setActiveDay] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(INITIAL_ACTIVITIES[0]?.id ?? null)

  const sorted = useMemo(
    () =>
      activities
        .filter((a) => a.day === activeDay)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [activities, activeDay],
  )

  const selectedActivity =
    sorted.find((a) => a.id === selectedId) ?? sorted[0] ?? null

  const handleAdd = (values) => {
    const id = Date.now()
    setActivities((prev) => [...prev, { ...values, id, notify: true }])
    setFormOpen(false)
    setActiveDay(values.day)
    setSelectedId(id)
  }

  const toggleNotify = (id) =>
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, notify: !a.notify } : a)),
    )

  const handleDelete = (id) =>
    setActivities((prev) => prev.filter((a) => a.id !== id))

  const handleQuickSave = (id, patch) =>
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Programme & Planification — Mariage Awa & Ibrahim
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {activities.length} activités sur {DAYS.length} jours
          </p>
        </div>
        <Button variant="gradient" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Ajouter une activité
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {DAYS.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => setActiveDay(d.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeDay === d.value
                ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                : 'border border-border text-muted hover:border-faint hover:text-ink'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {formOpen && (
            <ActivityForm
              day={activeDay}
              days={DAYS}
              onSubmit={handleAdd}
              onCancel={() => setFormOpen(false)}
            />
          )}

          {sorted.length === 0 ? (
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
