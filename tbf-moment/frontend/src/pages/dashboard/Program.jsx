import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import ActivityCard from '../../components/program/ActivityCard'
import ActivityForm from '../../components/program/ActivityForm'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'

const INITIAL_ACTIVITIES = [
  {
    id: 1,
    time: '14:00',
    title: 'Accueil des invités',
    location: 'Grande mosquée · Dakar',
    description: 'Installation et remise des programmes.',
    notify: true,
  },
  {
    id: 2,
    time: '16:00',
    title: 'Cérémonie religieuse',
    location: 'Grande mosquée · Dakar',
    speaker: 'Imam Alioune Sarr',
    description: "Bénédiction et échange des vœux.",
    notify: true,
  },
  {
    id: 3,
    time: '18:30',
    title: 'Séance photo',
    location: 'Jardins de la mosquée',
    notify: false,
  },
  {
    id: 4,
    time: '20:00',
    title: 'Réception et dîner',
    location: 'Salle Teranga · Almadies',
    description: 'Discours, dîner et ouverture de la piste de danse.',
    notify: true,
  },
]

export default function Program() {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES)
  const [formOpen, setFormOpen] = useState(false)

  const sorted = useMemo(
    () => [...activities].sort((a, b) => a.time.localeCompare(b.time)),
    [activities],
  )

  const handleAdd = (values) => {
    setActivities((prev) => [...prev, { ...values, id: Date.now(), notify: true }])
    setFormOpen(false)
  }

  const toggleNotify = (id) =>
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, notify: !a.notify } : a)),
    )

  const handleDelete = (id) =>
    setActivities((prev) => prev.filter((a) => a.id !== id))

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Programme — Mariage Awa & Ibrahim
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {activities.length} activités · affichage chronologique
          </p>
        </div>
        <Button variant="gradient" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Ajouter une activité
        </Button>
      </div>

      <div className="mt-8 max-w-2xl">
        {formOpen && (
          <ActivityForm onSubmit={handleAdd} onCancel={() => setFormOpen(false)} />
        )}

        {sorted.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-soft py-12 text-center text-sm text-faint">
            Aucune activité pour l'instant. Ajoutez la première étape de votre
            journée.
          </p>
        ) : (
          <div>
            {sorted.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onToggleNotify={toggleNotify}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
