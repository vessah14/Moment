import { useState } from 'react'
import { User } from 'lucide-react'
import Button from '../ui/Button'

export default function ActivityDetailPanel({ activity, rooms, onSave }) {
  const [room, setRoom] = useState(activity?.location ?? '')
  const [capacity, setCapacity] = useState(activity?.capacity ?? 50)
  const [saved, setSaved] = useState(false)

  if (!activity) {
    return (
      <div className="rounded-2xl border border-dashed border-border-soft p-8 text-center text-sm text-faint">
        Sélectionnez une activité pour voir ses détails.
      </div>
    )
  }

  const handleSave = (e) => {
    e.preventDefault()
    onSave(activity.id, { location: room, capacity })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border-soft bg-surface p-5">
      <div>
        <p className="text-xs font-semibold tracking-wider text-faint uppercase">
          Détails de l'activité
        </p>
        <h3 className="mt-2 font-semibold text-ink">{activity.title}</h3>
      </div>

      {activity.speaker && (
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-faint uppercase">
            Intervenant
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple/15 text-brand-purple">
              <User className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-ink">{activity.speaker}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-faint uppercase">
            Horaire
          </p>
          <p className="mt-1 text-sm text-ink">
            {activity.time} · {activity.duration} min
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-faint uppercase">
            Lieu
          </p>
          <p className="mt-1 text-sm font-medium text-brand-purple">
            {activity.location || '—'}
          </p>
        </div>
      </div>

      {activity.description && (
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-faint uppercase">
            Description
          </p>
          <p className="mt-1 text-sm text-muted">{activity.description}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-3 rounded-xl bg-surface-2 p-4">
        <p className="text-sm font-semibold text-ink">Planification rapide</p>
        <label className="block">
          <span className="text-xs font-medium text-ink">Attribuer un lieu</span>
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          >
            {rooms.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink">
            Capacité max invités
          </span>
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>
        <Button type="submit" variant="gradient" className="w-full">
          {saved ? 'Enregistré ✓' : 'Enregistrer les modifications'}
        </Button>
      </form>
    </div>
  )
}
