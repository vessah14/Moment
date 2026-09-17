import { useState } from 'react'
import Button from '../ui/Button'

const EMPTY = {
  time: '',
  title: '',
  location: '',
  speaker: '',
  description: '',
}

export default function ActivityForm({ onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY)

  const update = (patch) => setValues((prev) => ({ ...prev, ...patch }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!values.time || !values.title) return
    onSubmit(values)
    setValues(EMPTY)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-2xl border border-brand-purple/40 bg-surface p-5"
    >
      <h3 className="font-semibold text-ink">Nouvelle activité</h3>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
        <label className="col-span-1 block sm:col-span-3">
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

        <label className="col-span-2 block sm:col-span-4">
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
