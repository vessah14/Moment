import { Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import Toggle from '../../components/builder/Toggle'
import DashboardLayout from '../../components/layout/DashboardLayout'

const ACTIONS_BY_STATUS = {
  'À valider': ['Publier', 'Refuser', 'Répondre'],
  Publié: ['Mettre en avant', 'Masquer'],
  Signalé: ['Conserver', 'Retirer'],
  Masqué: ['Republier'],
}

const NEXT_STATUS = {
  Publier: 'Publié',
  Refuser: 'Masqué',
  'Mettre en avant': 'Publié',
  Masquer: 'Masqué',
  Conserver: 'Publié',
  Retirer: 'Masqué',
  Republier: 'Publié',
}

const INITIAL_MESSAGES = [
  {
    id: 1,
    name: 'Awa Sarr',
    role: 'Invitée',
    time: 'il y a 40 min',
    status: 'À valider',
    text: "Emplacement du message laissé par l'invité. Trois lignes maximum affichées, le texte complet reste consultable au clic.",
  },
  {
    id: 2,
    name: 'Moussa Traoré',
    role: 'Invité',
    time: 'hier',
    status: 'Publié',
    text: "Emplacement du message laissé par l'invité, déjà validé et visible sur la page publique.",
  },
  {
    id: 3,
    name: 'Aminata Bâ',
    role: 'VIP',
    time: 'il y a 3 jours',
    status: 'Signalé',
    text: 'Message signalé par un autre invité. La modération décide de le conserver ou de le retirer.',
  },
]

export default function GuestBook() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [filter, setFilter] = useState('En attente')
  const [moderation, setModeration] = useState(true)
  const [anonymous, setAnonymous] = useState(false)
  const [photos, setPhotos] = useState(true)
  const [exportState, setExportState] = useState('idle')

  const handleExport = () => {
    setExportState('loading')
    setTimeout(() => setExportState('done'), 1200)
  }

  const scrollToSettings = () => {
    document
      .getElementById('guestbook-settings')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const filters = [
    { label: 'En attente', count: messages.filter((m) => m.status === 'À valider').length },
    { label: 'Publiés', count: messages.filter((m) => m.status === 'Publié').length },
    { label: 'Signalés', count: messages.filter((m) => m.status === 'Signalé').length },
  ]

  const statusByFilter = { 'En attente': 'À valider', Publiés: 'Publié', Signalés: 'Signalé' }
  const visible = messages.filter((m) => m.status === statusByFilter[filter])

  const applyAction = (id, action) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: NEXT_STATUS[action] ?? m.status } : m)),
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Livre d'or</h1>
          <p className="mt-1.5 text-sm text-muted">
            {messages.length} messages · {filters[0].count} en attente · modération activée
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={scrollToSettings}>
            Règles de modération
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportState === 'loading'}
          >
            {exportState === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : exportState === 'done' ? (
              <Check className="h-4 w-4 text-success" />
            ) : null}
            {exportState === 'loading'
              ? 'Export...'
              : exportState === 'done'
                ? 'Exporté'
                : 'Exporter en livre'}
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="flex flex-wrap gap-3">
            {filters.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => setFilter(f.label)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === f.label
                    ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                    : 'border border-border text-muted hover:border-faint hover:text-ink'
                }`}
              >
                {f.label} · {f.count}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {visible.length === 0 && (
              <p className="rounded-xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
                Aucun message dans « {filter} ».
              </p>
            )}
            {visible.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border bg-surface p-5 ${
                  msg.status === 'À valider'
                    ? 'border-brand-orange/40'
                    : 'border-border-soft'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={msg.name} />
                    <div>
                      <p className="font-medium text-ink">{msg.name}</p>
                      <p className="text-xs text-faint">
                        {msg.role} · {msg.time}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={msg.status} />
                </div>

                <p className="mt-3 text-sm text-muted">{msg.text}</p>

                <div className="mt-4 flex gap-2">
                  {(ACTIONS_BY_STATUS[msg.status] ?? []).map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => applyAction(msg.id, action)}
                      className={`rounded-lg border px-4 py-1.5 text-xs font-medium transition ${
                        action === 'Publier' || action === 'Conserver' || action === 'Republier'
                          ? 'border-success/30 text-success hover:bg-success/10'
                          : action === 'Refuser' || action === 'Retirer'
                            ? 'border-danger/30 text-danger hover:bg-danger/10'
                            : 'border-border text-muted hover:border-faint'
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div
            id="guestbook-settings"
            className="rounded-xl border border-border-soft bg-surface p-5 transition"
          >
            <p className="text-xs font-semibold tracking-wider text-faint uppercase">
              Réglages
            </p>
            <div className="mt-4 space-y-4">
              <Toggle
                label="Modération avant publication"
                checked={moderation}
                onChange={setModeration}
              />
              <Toggle
                label="Messages anonymes"
                checked={anonymous}
                onChange={setAnonymous}
              />
              <Toggle
                label="Photos dans les messages"
                checked={photos}
                onChange={setPhotos}
              />
            </div>

            <p className="mt-5 text-xs font-semibold tracking-wider text-faint uppercase">
              Notifications
            </p>
            <p className="mt-2 text-sm text-muted">
              Un e-mail est envoyé à chaque nouveau message en attente.
            </p>
          </div>

          <div className="rounded-xl border border-[color:var(--color-gold)]/30 bg-surface p-5">
            <p className="text-xs font-semibold tracking-wider text-[color:var(--color-gold)] uppercase">
              Premium
            </p>
            <p className="mt-2 text-sm text-muted">
              Exportez le livre d'or en PDF relié, prêt à imprimer.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
