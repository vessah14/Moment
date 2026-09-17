import { useState } from 'react'
import { AUDIENCES, CHANNELS } from '../../data/communicationChannels'
import Button from '../ui/Button'

const TAGS = ['prénom', 'nom', 'date', 'lieu', 'lien']

export default function CampaignComposer({ onCreate, onCancel }) {
  const [name, setName] = useState('')
  const [channel, setChannel] = useState('E-mail')
  const [audience, setAudience] = useState(AUDIENCES[0])
  const [message, setMessage] = useState('')
  const [timing, setTiming] = useState('now')
  const [scheduleDate, setScheduleDate] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    if (timing === 'later' && !scheduleDate) return
    onCreate({
      name: name.trim(),
      channel,
      audience,
      message: message.trim(),
      status: timing === 'now' ? 'Envoyée' : 'Programmée',
      scheduledLabel: timing === 'now' ? "À l'instant" : scheduleDate,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-2xl border border-brand-purple/40 bg-surface p-5"
    >
      <h3 className="font-semibold text-ink">Nouvelle campagne</h3>

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

      <div className="mt-4">
        <span className="text-xs font-medium text-ink">Envoi</span>
        <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTiming('now')}
            className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
              timing === 'now'
                ? 'border-brand-purple bg-brand-purple/10 text-ink'
                : 'border-border-soft text-muted hover:border-faint'
            }`}
          >
            Envoyer maintenant
          </button>
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
              timing === 'later'
                ? 'border-brand-purple bg-brand-purple/10'
                : 'border-border-soft'
            }`}
          >
            <button
              type="button"
              onClick={() => setTiming('later')}
              className={`shrink-0 text-sm ${timing === 'later' ? 'text-ink' : 'text-muted'}`}
            >
              Programmer
            </button>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => {
                setScheduleDate(e.target.value)
                setTiming('later')
              }}
              className="w-full min-w-0 rounded-md border-0 bg-transparent text-xs text-ink outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="gradient">
          {timing === 'now' ? 'Envoyer' : 'Programmer'}
        </Button>
      </div>
    </form>
  )
}
