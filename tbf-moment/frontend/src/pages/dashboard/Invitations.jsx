import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { listEvents } from '../../api/events'
import { listGuests } from '../../api/guests'
import { createCampaign, listCampaigns } from '../../api/campaigns'

const CHANNELS = ['WhatsApp', 'E-mail', 'SMS']
const TAGS = ['prénom', 'nom', 'date', 'lieu', 'lien']
const DEFAULT_MESSAGE =
  'Bonjour {prénom}, nous serions honorés de votre présence le {date}. Confirmez ici : {lien}'

export default function Invitations() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [guests, setGuests] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [channel, setChannel] = useState('WhatsApp')
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

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
    Promise.all([listGuests(eventId), listCampaigns(eventId)])
      .then(([guestsData, campaignsData]) => {
        setGuests(guestsData ?? [])
        setCampaigns(campaignsData ?? [])
        setError('')
      })
      .catch((err) => setError(err.message || 'Impossible de charger les données.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedEventId) return
    reload(selectedEventId)
  }, [selectedEventId])

  const handleSend = async () => {
    setSending(true)
    setError('')
    try {
      await createCampaign(
        {
          name: 'Invitation',
          channel,
          audience: 'Tous les invités',
          body: message,
          sendNow: true,
        },
        selectedEventId,
      )
      setSent(true)
      reload(selectedEventId)
      setTimeout(() => setSent(false), 4000)
    } catch (err) {
      setError(err.message || "L'enregistrement a échoué.")
    } finally {
      setSending(false)
    }
  }

  const invitationCampaigns = campaigns.filter((c) => c.status === 'Envoyee')
  const stats = [
    { label: 'Invités', value: guests.length },
    { label: 'Confirmés', value: guests.filter((g) => g.status === 'Present').length },
    { label: 'En attente', value: guests.filter((g) => g.status === 'EnAttente').length },
    { label: 'Campagnes envoyées', value: invitationCampaigns.length },
  ]

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-ink">Invitations</h1>
        <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
          Créez d'abord un événement avec des invités.
        </p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Invitations</h1>
          <p className="mt-1.5 text-sm text-muted">
            Composez et enregistrez l'envoi des invitations — {selectedEvent?.name ?? ''}
          </p>
        </div>
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
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-8 max-w-xl rounded-2xl border border-border-soft bg-panel p-6">
        <div>
          <span className="text-sm font-medium text-ink">Canal d'envoi</span>
          <div className="mt-2 grid grid-cols-3 gap-3">
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
          <span className="text-sm font-medium text-ink">Message personnalisable</span>
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
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-xs text-faint">{stat.label}</dt>
              <dd className="mt-1 font-mono text-lg font-semibold text-ink">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-xs text-faint">
          Aucun service d'envoi n'est branché : ceci enregistre la campagne avec le nombre
          réel de destinataires, sans envoi effectif.
        </p>

        <Button
          variant="gradient"
          className="mt-4 w-full disabled:opacity-70"
          disabled={sending || guests.length === 0}
          onClick={handleSend}
        >
          {sending ? 'Enregistrement...' : "Marquer comme envoyée"}
        </Button>
        {sent && (
          <p className="mt-3 text-center text-sm text-success">
            Campagne enregistrée pour {guests.length} invité(s) par {channel}.
          </p>
        )}
      </div>
    </DashboardLayout>
  )
}
