import { AlertTriangle, FileDown, MonitorPlay } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { listEvents } from '../../api/events'
import { listEventBlocks, updateEventBlock } from '../../api/eventBlocks'
import { templateFromCustomFields } from '../../utils/templateTheme'
import { downloadCsv } from '../../utils/csv'
import {
  createGuestBookEntry,
  deleteGuestBookEntry,
  listGuestBookEntries,
  replyGuestBookEntry,
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
  const [replyOpenId, setReplyOpenId] = useState(null)
  const [replyDraft, setReplyDraft] = useState('')
  const [replying, setReplying] = useState(false)
  // Bloc « Livre d'or » de l'événement : réglage de la validation automatique.
  const [guestBookBlock, setGuestBookBlock] = useState(null)
  const [savingAuto, setSavingAuto] = useState(false)

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
    setGuestBookBlock(null)
    listEventBlocks(selectedEventId)
      .then((blocks) => setGuestBookBlock((blocks ?? []).find((b) => b.blockType === "Livre d'or") ?? null))
      .catch(() => {})
  }, [selectedEventId])

  const selectedEvent = events.find((ev) => ev.id === selectedEventId)
  // Modèle Envol : le livre d'or est le mur des vœux projeté dans la salle.
  const wallMode = templateFromCustomFields(selectedEvent?.customFields)?.theme === 'envol'
  const blockSettings = useMemo(() => {
    try {
      return JSON.parse(guestBookBlock?.content || '{}') ?? {}
    } catch {
      return {}
    }
  }, [guestBookBlock])
  const autoApprove = blockSettings.autoApprove === true

  // Pendant la cérémonie, les vœux arrivent en continu : la liste se relit toute seule.
  useEffect(() => {
    if (!wallMode || !selectedEventId) return
    const timer = setInterval(() => {
      listGuestBookEntries(selectedEventId).then((data) => setMessages(data ?? [])).catch(() => {})
    }, 20000)
    return () => clearInterval(timer)
  }, [wallMode, selectedEventId])

  const toggleAutoApprove = async (on) => {
    if (!guestBookBlock) return
    setSavingAuto(true)
    setError('')
    try {
      const updated = await updateEventBlock(guestBookBlock.id, {
        blockType: guestBookBlock.blockType,
        position: guestBookBlock.position,
        isVisible: guestBookBlock.isVisible,
        content: JSON.stringify({ ...blockSettings, autoApprove: on }),
      })
      setGuestBookBlock(updated)
    } catch (err) {
      setError(err.message || "Le réglage n'a pas pu être enregistré.")
    } finally {
      setSavingAuto(false)
    }
  }

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

  const openReply = (msg) => {
    setReplyOpenId((prev) => (prev === msg.id ? null : msg.id))
    setReplyDraft(msg.reply ?? '')
  }

  const submitReply = async (id) => {
    setError('')
    setReplying(true)
    try {
      await replyGuestBookEntry(id, replyDraft.trim())
      setReplyOpenId(null)
      setReplyDraft('')
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "La réponse n'a pas pu être enregistrée.")
    } finally {
      setReplying(false)
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
    // Nom et message saisis par les visiteurs du site : neutralisés par downloadCsv.
    downloadCsv(
      'livre-or.csv',
      ['Auteur', 'Message', 'Date'],
      published.map((m) => [m.authorName, m.message, m.createdAt]),
    )
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
          <h1 className="text-2xl font-bold text-ink">{wallMode ? 'Vœux à valider' : "Livre d'or"}</h1>
          <p className="mt-1.5 text-sm text-muted">
            {wallMode
              ? "Aucun vœu ne passe à l'écran de la salle sans votre accord."
              : `${messages.length} messages · ${filters[0].count} en attente`}
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
          {selectedEvent?.slug && selectedEvent.status === 'Publie' && (
            <a
              href={`/e/${encodeURIComponent(selectedEvent.slug)}/${wallMode ? 'projection' : 'mur'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink hover:border-brand-purple"
            >
              <MonitorPlay className="h-4 w-4" />
              Ouvrir l'écran de la salle
            </a>
          )}
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

      {guestBookBlock && (
        <label className="mt-6 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={autoApprove}
            disabled={savingAuto}
            onChange={(e) => toggleAutoApprove(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-brand-purple"
          />
          <span>
            Valider automatiquement les messages sans alerte
            <span className="block text-xs text-faint">
              Un message qui contient un numéro de téléphone, un lien ou un mot signalé attend toujours votre accord.
            </span>
          </span>
        </label>
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

      {wallMode ? (
        <WishColumns
          loading={loading}
          messages={messages}
          onShow={(id) => applyAction(id, 'Publie')}
          onRefuse={(id) => applyAction(id, 'Masque')}
          onRemove={(id) => applyAction(id, 'EnAttente')}
        />
      ) : (
      <>
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
                    <p className="font-medium text-ink">
                      {msg.authorName}
                      {msg.service && <span className="ml-1.5 text-xs font-normal text-faint">· {msg.service}</span>}
                    </p>
                    <p className="text-xs text-faint">
                      {new Date(msg.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                <StatusBadge status={STATUS_LABELS[msg.status]} />
              </div>

              {msg.alert && <AlertChip text={msg.alert} />}
              <p className="mt-3 text-sm text-muted">{msg.message}</p>

              {msg.reply && replyOpenId !== msg.id && (
                <div className="mt-3 rounded-lg border border-border-soft bg-surface-2 px-4 py-3">
                  <p className="text-xs font-semibold text-brand-purple">Votre réponse</p>
                  <p className="mt-1 text-sm text-ink">{msg.reply}</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
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
                  onClick={() => openReply(msg)}
                  className={`rounded-lg border px-4 py-1.5 text-xs font-medium transition ${
                    replyOpenId === msg.id
                      ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                      : 'border-border text-muted hover:border-faint'
                  }`}
                >
                  {msg.reply ? 'Modifier la réponse' : 'Répondre'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(msg.id)}
                  className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-muted transition hover:border-faint"
                >
                  Supprimer
                </button>
              </div>

              {replyOpenId === msg.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    rows={2}
                    autoFocus
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    placeholder="Écrire une réponse publique..."
                    className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyOpenId(null)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted hover:text-ink"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      disabled={!replyDraft.trim() || replying}
                      onClick={() => submitReply(msg.id)}
                      className="rounded-lg bg-brand-indigo px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      {replying ? 'Envoi…' : 'Envoyer la réponse'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
      </>
      )}
    </DashboardLayout>
  )
}

function AlertChip({ text }) {
  return (
    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-orange/15 px-3 py-1 text-xs font-semibold text-brand-orange">
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
      {text}
    </span>
  )
}

const timeOf = (iso) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

// Mur des vœux (modèle Envol) : à gauche les vœux à valider, à droite ceux qui passent à
// l'écran de la salle.
function WishColumns({ loading, messages, onShow, onRefuse, onRemove }) {
  const pending = messages.filter((m) => m.status === 'EnAttente' || m.status === 'Signale')
  const onScreen = messages.filter((m) => m.status === 'Publie')
  return (
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
      <section className="space-y-3" aria-labelledby="wishes-pending">
        <h2 id="wishes-pending" className="text-sm font-semibold text-ink">
          À valider · {pending.length}
        </h2>
        {loading && <p className="text-sm text-faint">Chargement…</p>}
        {!loading && pending.length === 0 && (
          <p className="rounded-xl border border-dashed border-border-soft py-8 text-center text-sm text-faint">Tout est validé.</p>
        )}
        {pending.map((msg) => (
          <article key={msg.id} className={`rounded-xl border bg-surface p-4 ${msg.alert ? 'border-brand-orange/60' : 'border-border-soft'}`}>
            {msg.alert && <AlertChip text={msg.alert} />}
            <p className="mt-2 text-[15px] text-ink">« {msg.message} »</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-faint">
              <span>
                {[msg.authorName, msg.service, timeOf(msg.createdAt)].filter(Boolean).join(' · ')}
              </span>
              <span className="flex gap-2">
                <button type="button" onClick={() => onRefuse(msg.id)} className="min-h-9 rounded-lg border border-border px-3 font-semibold text-muted hover:border-danger hover:text-danger">
                  Refuser
                </button>
                <button type="button" onClick={() => onShow(msg.id)} className="min-h-9 rounded-lg bg-brand-purple px-3 font-semibold text-white hover:opacity-90">
                  Afficher à l'écran
                </button>
              </span>
            </div>
          </article>
        ))}
      </section>
      <section className="space-y-3" aria-labelledby="wishes-screen">
        <h2 id="wishes-screen" className="text-sm font-semibold text-ink">
          Sur l'écran de la salle · {onScreen.length}
        </h2>
        {!loading && onScreen.length === 0 && (
          <p className="rounded-xl border border-dashed border-border-soft py-8 text-center text-sm text-faint">Aucun vœu à l'écran pour l'instant.</p>
        )}
        {onScreen.map((msg) => (
          <article key={msg.id} className="flex items-start gap-3 rounded-xl bg-[#0F0B2E] p-4 text-[#EDEBFA]">
            <div className="min-w-0 flex-1">
              <p className="text-sm">« {msg.message} »</p>
              <p className="mt-1 text-xs text-[#A9A4C9]">{[msg.authorName, msg.service].filter(Boolean).join(' · ')}</p>
            </div>
            <button type="button" onClick={() => onRemove(msg.id)} className="min-h-9 shrink-0 rounded-lg border border-white/25 px-3 text-xs font-semibold hover:bg-white/10">
              Retirer de l'écran
            </button>
          </article>
        ))}
      </section>
    </div>
  )
}
