import { useState } from 'react'
import { AUDIENCES, CHANNELS } from '../../data/communicationChannels'
import Button from '../ui/Button'

const TAGS = ['prénom', 'nom', 'date', 'lieu', 'lien']

export default function CampaignComposer({ defaultChannel = 'E-mail', onCreate }) {
  const [name, setName] = useState('')
  const [channel, setChannel] = useState(defaultChannel)
  const [audience, setAudience] = useState(AUDIENCES[0])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setName('')
    setMessage('')
  }

  const handleSubmit = async (e, sendNow) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setSubmitting(true)
    try {
      await onCreate({
        name: name.trim(),
        channel,
        audience,
        body: message.trim(),
        sendNow,
      })
      reset()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="rounded-2xl border border-border-soft bg-surface p-5"
    >
      <h3 className="font-semibold text-ink">Nouveau message</h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-ink">
            Nom de la campagne
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Rappel J-7"
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-ink">Audience</span>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          >
            {AUDIENCES.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <span className="text-xs font-medium text-ink">Canal</span>
        <div className="mt-1.5 grid grid-cols-4 gap-2">
          {CHANNELS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setChannel(c.value)}
              className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition ${
                channel === c.value
                  ? 'border-brand-purple bg-brand-purple/10 text-ink'
                  : 'border-border text-muted hover:border-faint'
              }`}
            >
              <c.icon className="h-4 w-4" />
              {c.value}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-medium text-ink">Message</span>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Bonjour {prénom}, plus que quelques jours avant le grand jour !"
          className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
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

      <p className="mt-4 text-xs text-faint">
        Aucun service d'envoi (e-mail/SMS/WhatsApp) n'est branché — la campagne est
        enregistrée avec le nombre réel de destinataires concernés, sans envoi effectif.
      </p>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button type="button" variant="ghost" onClick={reset} disabled={submitting}>
          Réinitialiser
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={(e) => handleSubmit(e, false)}
        >
          Enregistrer en brouillon
        </Button>
        <Button
          type="button"
          variant="gradient"
          disabled={submitting}
          onClick={(e) => handleSubmit(e, true)}
        >
          Marquer comme envoyée
        </Button>
      </div>
    </form>
  )
}
