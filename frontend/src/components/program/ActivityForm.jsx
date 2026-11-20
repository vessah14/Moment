import { useState } from 'react'
import Button from '../ui/Button'
import Dialog from '../ui/Dialog'

function buildEmpty(date) {
  return {
    date,
    time: '',
    duration: 60,
    title: '',
    location: '',
    speaker: '',
    description: '',
    capacity: 50,
  }
}

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-purple'

// Fenêtre modale « Nouvelle activité ». onSubmit renvoie une promesse : en cas d'échec,
// l'erreur s'affiche dans la fenêtre et la saisie est conservée.
export default function ActivityForm({ date, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => buildEmpty(date))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (patch) => setValues((prev) => ({ ...prev, ...patch }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!values.date || !values.time || !values.title || saving) return
    setError('')
    setSaving(true)
    try {
      await onSubmit(values)
    } catch (err) {
      setError(err.message || "L'ajout a échoué.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open title="Nouvelle activité" onClose={onCancel} size="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-ink">Titre</span>
          <input
            type="text"
            required
            placeholder="Cérémonie religieuse"
            value={values.title}
            onChange={(e) => update({ title: e.target.value })}
            className={fieldClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium text-ink">Date</span>
            <input type="date" required value={values.date} onChange={(e) => update({ date: e.target.value })} className={fieldClass} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Heure</span>
            <input type="time" required value={values.time} onChange={(e) => update({ time: e.target.value })} className={fieldClass} />
          </label>
          <label className="col-span-2 block sm:col-span-1">
            <span className="text-xs font-medium text-ink">Durée (min)</span>
            <input
              type="number"
              min="5"
              step="5"
              value={values.duration}
              onChange={(e) => update({ duration: Number(e.target.value) })}
              className={fieldClass}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-ink">Lieu</span>
            <input
              type="text"
              placeholder="Grande mosquée · Dakar"
              value={values.location}
              onChange={(e) => update({ location: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Intervenant (optionnel)</span>
            <input
              type="text"
              placeholder="Imam Alioune Sarr"
              value={values.speaker}
              onChange={(e) => update({ speaker: e.target.value })}
              className={fieldClass}
            />
          </label>
        </div>

        <label className="block sm:w-1/2 sm:pr-2">
          <span className="text-xs font-medium text-ink">Capacité max</span>
          <input
            type="number"
            min="1"
            value={values.capacity}
            onChange={(e) => update({ capacity: Number(e.target.value) })}
            className={fieldClass}
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-ink">Description (optionnel)</span>
          <textarea
            rows={3}
            value={values.description}
            onChange={(e) => update({ description: e.target.value })}
            className={`${fieldClass} resize-none`}
          />
        </label>

        {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" variant="gradient" disabled={saving}>
            {saving ? 'Ajout…' : 'Ajouter au programme'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
