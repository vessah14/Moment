import { FileDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { listEvents } from '../../api/events'
import {
  createGuestBookEntry,
  deleteGuestBookEntry,
  listGuestBookEntries,
  updateGuestBookStatus,
} from '../../api/guestBook'

const STATUS_LABELS = { EnAttente: 'À valider', Publie: 'Publié', Masque: 'Masqué', Signale: 'Signalé' }
const ACTIONS_BY_STATUS = {
  EnAttente: [
    { label: 'Publier', next: 'Publie' },
    { label: 'Refuser', next: 'Masque' },
  ],
  Publie: [{ label: 'Masquer', next: 'Masque' }],
  Masque: [{ label: 'Republier', next: 'Publie' }],
  Signale: [
    { label: 'Conserver', next: 'Publie' },
    { label: 'Retirer', next: 'Masque' },
  ],
}
const FILTERS = [
  { label: 'En attente', status: 'EnAttente' },
  { label: 'Publiés', status: 'Publie' },
  { label: 'Masqués', status: 'Masque' },
]

export default function GuestBook() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('EnAttente')
  const [formOpen, setFormOpen] = useState(false)

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
    listGuestBookEntries(eventId)
      .then((data) => {
        setMessages(data ?? [])
        setError('')
      })
      .catch((err) => setError(err.message || 'Impossible de charger le livre d\'or.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedEventId) return
    reload(selectedEventId)
  }, [selectedEventId])

  const filters = useMemo(
    () => FILTERS.map((f) => ({ ...f, count: messages.filter((m) => m.status === f.status).length })),
    [messages],
  )
  const visible = messages.filter((m) => m.status === filter)

  const applyAction = async (id, next) => {
    setError('')
    try {
      await updateGuestBookStatus(id, next)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'action a échoué.")
    }
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      await deleteGuestBookEntry(id)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || 'La suppression a échoué.')
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const authorName = form.get('authorName')?.toString().trim()
    const message = form.get('message')?.toString().trim()
    if (!authorName || !message) return
    setError('')
    try {
      await createGuestBookEntry({ authorName, message }, selectedEventId)
      setFormOpen(false)
      e.target.reset()
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'ajout a échoué.")
    }
  }

  const handleExport = () => {
    const published = messages.filter((m) => m.status === 'Publie')
    const header = 'Auteur,Message,Date'
    const rows = published.map((m) =>
      [m.authorName, `"${m.message.replace(/"/g, '""')}"`, m.createdAt].join(','),
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'livre-or.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-ink">Livre d'or</h1>
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
          <h1 className="text-2xl font-bold text-ink">Livre d'or</h1>
          <p className="mt-1.5 text-sm text-muted">
            {messages.length} messages · {filters[0].count} en attente
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
          <Button variant="outline" onClick={handleExport} disabled={messages.length === 0}>
            <FileDown className="h-4 w-4" />
            Exporter
          </Button>
          <Button variant="gradient" onClick={() => setFormOpen((v) => !v)}>
            Ajouter un message
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {formOpen && (
        <form
          onSubmit={handleAdd}
          className="mt-6 space-y-3 rounded-2xl border border-brand-purple/40 bg-surface p-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-ink">Nom de l'auteur</span>
              <input
                name="authorName"
                required
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-ink">Message</span>
            <textarea
              name="message"
              required
              rows={3}
              className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <Button type="submit" variant="gradient">
            Ajouter
          </Button>
        </form>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {filters.map((f) => (
          <button
            key={f.status}
            type="button"
            onClick={() => setFilter(f.status)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f.status
                ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                : 'border border-border text-muted hover:border-faint hover:text-ink'
            }`}
          >
            {f.label} · {f.count}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {loading && <p className="text-center text-sm text-faint">Chargement…</p>}
        {!loading && visible.length === 0 && (
          <p className="rounded-xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
            Aucun message ici.
          </p>
        )}
        {!loading &&
          visible.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl border bg-surface p-5 ${
                msg.status === 'EnAttente' ? 'border-brand-orange/40' : 'border-border-soft'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={msg.authorName} />
                  <div>
                    <p className="font-medium text-ink">{msg.authorName}</p>
                    <p className="text-xs text-faint">
                      {new Date(msg.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                <StatusBadge status={STATUS_LABELS[msg.status]} />
              </div>

              <p className="mt-3 text-sm text-muted">{msg.message}</p>

              <div className="mt-4 flex gap-2">
                {(ACTIONS_BY_STATUS[msg.status] ?? []).map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => applyAction(msg.id, action.next)}
                    className={`rounded-lg border px-4 py-1.5 text-xs font-medium transition ${
                      action.label === 'Publier' || action.label === 'Republier' || action.label === 'Conserver'
                        ? 'border-success/30 text-success hover:bg-success/10'
                        : 'border-danger/30 text-danger hover:bg-danger/10'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleDelete(msg.id)}
                  className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-muted transition hover:border-faint"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
      </div>
    </DashboardLayout>
  )
}
