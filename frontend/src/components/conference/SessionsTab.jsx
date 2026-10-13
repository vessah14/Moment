import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import Button from '../ui/Button'
import { useToast } from '../../utils/useToast'

export default function SessionsTab({ sessions, speakers, onAdd, onRemove }) {
  const toast = useToast()
  const [formOpen, setFormOpen] = useState(false)

  const sorted = useMemo(
    () => [...sessions].sort((a, b) => a.time.localeCompare(b.time)),
    [sessions],
  )

  const speakerName = (id) => speakers.find((s) => s.id === id)?.name

  const handleSubmit = (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const time = form.get('time')?.toString().trim()
    const title = form.get('title')?.toString().trim()
    const room = form.get('room')?.toString().trim()
    const speakerId = form.get('speakerId')?.toString() || null
    if (!time || !title) return
    onAdd({ time, title, room, speakerId })
    setFormOpen(false)
    e.target.reset()
    toast(`Session "${title}" ajoutée`)
  }

  const handleRemove = (session) => {
    onRemove(session.id)
    toast(`Session "${session.title}" supprimée`, { variant: 'danger' })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-ink">Sessions</h2>
          <p className="mt-1 text-sm text-muted">
            {sessions.length} session(s) programmée(s)
          </p>
        </div>
        <Button variant="gradient" onClick={() => setFormOpen((v) => !v)}>
          <Plus className="h-4 w-4" />
          Ajouter une session
        </Button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 grid gap-3 rounded-2xl border border-brand-purple/40 bg-surface p-5 sm:grid-cols-2"
        >
          <label className="block">
            <span className="text-xs font-medium text-ink">Heure</span>
            <input
              name="time"
              required
              placeholder="09:00"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Salle</span>
            <input
              name="room"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-ink">Titre</span>
            <input
              name="title"
              required
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-ink">Intervenant</span>
            <select
              name="speakerId"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            >
              <option value="">Aucun</option>
              {speakers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" variant="gradient">
              Ajouter
            </Button>
          </div>
        </form>
      )}

      <div className="mt-5 overflow-hidden rounded-2xl border border-border-soft bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-soft text-xs tracking-wider text-faint uppercase">
              <th className="px-6 py-3 font-medium">Heure</th>
              <th className="px-3 py-3 font-medium">Session</th>
              <th className="px-3 py-3 font-medium">Salle</th>
              <th className="px-3 py-3 font-medium">Intervenant</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((session) => (
              <tr key={session.id} className="border-b border-border-soft last:border-b-0">
                <td className="px-6 py-4 font-mono text-muted">{session.time}</td>
                <td className="px-3 py-4 font-medium text-ink">{session.title}</td>
                <td className="px-3 py-4 text-muted">{session.room || '—'}</td>
                <td className="px-3 py-4 text-muted">
                  {speakerName(session.speakerId) ?? '—'}
                </td>
                <td className="px-3 py-4">
                  <button
                    type="button"
                    onClick={() => handleRemove(session)}
                    className="rounded-lg p-1.5 text-faint transition hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
