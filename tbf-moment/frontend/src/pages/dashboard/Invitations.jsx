import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'

const CHANNELS = ['WhatsApp', 'E-mail', 'SMS', 'Lien']
const TAGS = ['prénom', 'nom', 'date', 'lieu', 'lien', 'qr']

const STATS = [
  { label: 'Envoyées', value: 240 },
  { label: 'Ouvertes', value: 171 },
  { label: 'Répondues', value: 208 },
  { label: 'Relances programmées', value: 2 },
]

const DEFAULT_MESSAGE =
  'Bonjour {prénom}, nous serions honorés de votre présence le {date}. Confirmez ici : {lien}'

export default function Invitations() {
  const [channel, setChannel] = useState('WhatsApp')
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    }, 900)
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-ink">Invitations</h1>
        <p className="mt-1.5 text-sm text-muted">
          Composez et envoyez les invitations — Mariage Awa & Ibrahim
        </p>
      </div>

      <div className="mt-8 max-w-xl rounded-2xl border border-border-soft bg-panel p-6">
        <div>
          <span className="text-sm font-medium text-ink">Canal d'envoi</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {CHANNELS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                  channel === c
                    ? 'border-brand-purple bg-brand-purple/10 text-ink'
                    : 'border-border text-muted hover:border-faint'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-ink">
            Message personnalisable
          </span>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-2 w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-xs text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </label>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border-soft pt-5">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="text-xs text-faint">{stat.label}</dt>
              <dd className="mt-1 font-mono text-lg font-semibold text-ink">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <Button
          variant="gradient"
          className="mt-6 w-full disabled:opacity-70"
          disabled={sending}
          onClick={handleSend}
        >
          {sending ? 'Envoi en cours...' : 'Envoyer les invitations'}
        </Button>
        {sent && (
          <p className="mt-3 text-center text-sm text-success">
            Invitations envoyées par {channel} à 240 invités.
          </p>
        )}
      </div>
    </DashboardLayout>
  )
}
