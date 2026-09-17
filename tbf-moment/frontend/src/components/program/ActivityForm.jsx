import { useState } from 'react'
import Button from '../ui/Button'

function buildEmpty(day) {
  return {
    day,
    time: '',
    duration: 60,
    title: '',
    location: '',
    speaker: '',
    description: '',
    capacity: 50,
  }
}

export default function ActivityForm({ day, days, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => buildEmpty(day))

  const update = (patch) => setValues((prev) => ({ ...prev, ...patch }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!values.time || !values.title) return
    onSubmit(values)
    setValues(buildEmpty(day))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-2xl border border-brand-purple/40 bg-surface p-5"
    >
      <h3 className="font-semibold text-ink">Nouvelle activité</h3>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {days.length > 1 && (
          <label className="col-span-1 block">
            <span className="text-xs font-medium text-ink">Jour</span>
            <select
              value={values.day}
              onChange={(e) => update({ day: Number(e.target.value) })}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            >
              {days.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="col-span-1 block">
          <span className="text-xs font-medium text-ink">Heure</span>
          <input
            type="text"
            required
            placeholder="16:00"
            value={values.time}
            onChange={(e) => update({ time: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>
        <label className="col-span-1 block">
          <span className="text-xs font-medium text-ink">Durée (min)</span>
          <input
            type="number"
            min="5"
            step="5"
            value={values.duration}
            onChange={(e) => update({ duration: Number(e.target.value) })}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="text-xs font-medium text-ink">Titre</span>
          <input
            type="text"
            required
            placeholder="Cérémonie religieuse"
            value={values.title}
            onChange={(e) => update({ title: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>

        <label className="col-span-1 block sm:col-span-2">
          <span className="text-xs font-medium text-ink">Lieu</span>
          <input
            type="text"
            placeholder="Grande mosquée · Dakar"
            value={values.location}
            onChange={(e) => update({ location: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>
        <label className="col-span-1 block sm:col-span-2">
          <span className="text-xs font-medium text-ink">
            Intervenant (optionnel)
          </span>
          <input
            type="text"
            placeholder="Imam Alioune Sarr"
            value={values.speaker}
            onChange={(e) => update({ speaker: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>

        <label className="col-span-1 block">
          <span className="text-xs font-medium text-ink">
            Capacité max
          </span>
          <input
            type="number"
            min="1"
            value={values.capacity}
            onChange={(e) => update({ capacity: Number(e.target.value) })}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>
        <label className="col-span-2 block sm:col-span-3">
          <span className="text-xs font-medium text-ink">
            Description (optionnel)
          </span>
          <textarea
            rows={2}
            value={values.description}
            onChange={(e) => update({ description: e.target.value })}
            className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="gradient">
          Ajouter au programme
        </Button>
      </div>
    </form>
  )
}
