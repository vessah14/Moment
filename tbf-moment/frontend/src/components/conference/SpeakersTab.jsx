import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import Button from '../ui/Button'

export default function SpeakersTab({ speakers, onAdd, onRemove }) {
  const [formOpen, setFormOpen] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const name = form.get('name')?.toString().trim()
    const role = form.get('role')?.toString().trim()
    const topic = form.get('topic')?.toString().trim()
    if (!name) return
    onAdd({ name, role, topic })
    setFormOpen(false)
    e.target.reset()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-ink">Intervenants</h2>
          <p className="mt-1 text-sm text-muted">
            {speakers.length} intervenant(s) confirmé(s)
          </p>
        </div>
        <Button variant="gradient" onClick={() => setFormOpen((v) => !v)}>
          <Plus className="h-4 w-4" />
          Ajouter un intervenant
        </Button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3 rounded-2xl border border-brand-purple/40 bg-surface p-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-ink">Nom</span>
              <input
                name="name"
                required
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-ink">
                Fonction · organisation
              </span>
              <input
                name="role"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-ink">Sujet abordé</span>
            <input
              name="topic"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <Button type="submit" variant="gradient">
            Ajouter
          </Button>
        </form>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            className="rounded-2xl border border-border-soft bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-purple/15 text-sm font-semibold text-brand-purple">
                {speaker.name
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <button
                type="button"
                onClick={() => onRemove(speaker.id)}
                className="rounded-lg p-1.5 text-faint transition hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <h3 className="mt-3 font-semibold text-ink">{speaker.name}</h3>
            {speaker.role && <p className="mt-0.5 text-xs text-faint">{speaker.role}</p>}
            {speaker.topic && (
              <p className="mt-2 text-sm text-muted">{speaker.topic}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
