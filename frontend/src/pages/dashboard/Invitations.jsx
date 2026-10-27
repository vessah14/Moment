import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { listEvents } from '../../api/events'
import { listEventLocations } from '../../api/eventLocations'
import { listGuests } from '../../api/guests'
import { createCampaign, listCampaigns } from '../../api/campaigns'
import {
  guestsForAudience,
  personalizeMessage,
} from '../../utils/invitationMessage'
import { guestMessageUrl, internationalNumber, nextUnsent, readSent, writeSent } from '../../utils/whatsapp'

const CHANNELS = ['WhatsApp', 'E-mail', 'SMS']
const TAGS = ['prénom', 'nom', 'date', 'lieu', 'lien']
const DEFAULT_MESSAGE =
  'Bonjour {prénom}, nous serions honorés de votre présence le {date}. Confirmez ici : {lien}'
const AUDIENCES = ['Tous les invités', 'Confirmés', 'En attente', 'Refus']

export default function Invitations () {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [guests, setGuests] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [locationResult, setLocationResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // WhatsApp d'abord : c'est là que circulent les invitations.
  const [channel, setChannel] = useState('WhatsApp')
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [audience, setAudience] = useState(AUDIENCES[0])
  const [selectedGuestId, setSelectedGuestId] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  // Envoi en série (WhatsApp, SMS) : invités déjà contactés, gardés sur cet appareil.
  const sentKey = `${selectedEventId}|${channel}`
  const [sentState, setSentState] = useState({ key: '', ids: new Set() })
  const sentIds = useMemo(
    () => (sentState.key === sentKey ? sentState.ids : readSent(selectedEventId, channel)),
    [sentState, sentKey, selectedEventId, channel],
  )
  const saveSent = (ids) => {
    writeSent(selectedEventId, channel, ids)
    setSentState({ key: sentKey, ids })
  }

  useEffect(() => {
    listEvents()
      .then(data => {
        setEvents(data ?? [])
        if (data?.length) setSelectedEventId(data[0].id)
        else setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Impossible de charger vos événements.')
        setLoading(false)
      })
  }, [])

  const reload = eventId => {
    setLoading(true)
    Promise.all([listGuests(eventId), listCampaigns(eventId)])
      .then(([guestsData, campaignsData]) => {
        setGuests(guestsData ?? [])
        setCampaigns(campaignsData ?? [])
        setError('')
      })
      .catch(err =>
        setError(err.message || 'Impossible de charger les données.')
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedEventId) return
    reload(selectedEventId)
  }, [selectedEventId])

  useEffect(() => {
    if (!selectedEventId) return
    let cancelled = false
    listEventLocations(selectedEventId)
      .then(locations => {
        if (!cancelled) setLocationResult({ eventId: selectedEventId, location: locations?.[0] ?? null })
      })
      .catch(err => {
        if (!cancelled) setLocationResult({ eventId: selectedEventId, error: err.message || 'Lieu indisponible' })
      })
    return () => {
      cancelled = true
    }
  }, [selectedEventId])

  const handleSend = async () => {
    if (channel === 'E-mail' && emailRecipients.length === 0) {
      setError("Aucun invité de cette audience n'a d'adresse e-mail.")
      return
    }
    setSending(true)
    setError('')
    setSendResult(null)
    try {
      const result = await createCampaign(
        {
          name: 'Invitation',
          channel,
          audience,
          body: message,
          sendNow: channel === 'E-mail'
        },
        selectedEventId
      )
      setSendResult({
        channel,
        emailsSentCount: result?.emailsSentCount ?? 0,
        emailRecipientCount: emailRecipients.length,
        recipientCount: result?.recipientCount ?? guests.length,
        deliveryError: result?.deliveryError ?? null
      })
      reload(selectedEventId)
      setTimeout(() => setSendResult(null), 7000)
    } catch (err) {
      setError(err.message || "L'enregistrement a échoué.")
    } finally {
      setSending(false)
    }
  }

  const selectedEvent = events.find(e => e.id === selectedEventId)
  const eventLocation = locationResult?.eventId === selectedEventId ? locationResult.location : null
  const previewEvent = selectedEvent && {
    ...selectedEvent,
    location: eventLocation?.address || eventLocation?.label || '',
  }
  const invitationCampaigns = campaigns.filter(c => c.status === 'Envoyee')
  const audienceGuests = guestsForAudience(guests, audience)
  const emailRecipients = audienceGuests.filter(guest => guest.email?.trim())
  const shareGuests = audienceGuests.filter(guest =>
    channel === 'E-mail'
      ? Boolean(guest.email?.trim())
      : channel === 'SMS'
        ? Boolean(guest.phone?.trim())
        : true,
  )
  const selectedGuest =
    shareGuests.find(guest => guest.id === selectedGuestId) ?? shareGuests[0]
  const personalizedPreview = personalizeMessage(message, selectedGuest, previewEvent, window.location.origin)
  const shareUrl = selectedGuest && channel !== 'E-mail'
    ? guestMessageUrl(channel, selectedGuest.phone, personalizedPreview)
    : ''
  const sentCount = shareGuests.filter(guest => sentIds.has(guest.id)).length
  // Message ouvert pour cet invité : il est noté « envoyé » et le suivant s'affiche.
  const markSentAndNext = () => {
    if (!selectedGuest) return
    const ids = new Set(sentIds).add(selectedGuest.id)
    saveSent(ids)
    const next = nextUnsent(shareGuests, ids, selectedGuest.id)
    if (next) setSelectedGuestId(next.id)
  }
  const stats = [
    { label: 'Invités ciblés', value: audienceGuests.length },
    {
      label: 'Confirmés',
      value: audienceGuests.filter(g => g.status === 'Present').length
    },
    {
      label: 'En attente',
      value: audienceGuests.filter(g => g.status === 'EnAttente').length
    },
    { label: 'Campagnes envoyées', value: invitationCampaigns.length }
  ]

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className='text-2xl font-bold text-ink'>Invitations</h1>
        <Link className='mt-4 inline-flex rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white' to='/dashboard/evenements/nouveau'>
          Créer un événement
        </Link>
        <p className='mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint'>
          Créez d'abord un événement avec des invités.
        </p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-ink'>Invitations</h1>
          <p className='mt-1.5 text-sm text-muted'>
            Préparez vos invitations pour{' '}
            {selectedEvent?.name ?? ''}
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Link className='inline-flex items-center rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-ink' to={`/dashboard/participants?eventId=${encodeURIComponent(selectedEventId)}&add=1`}>
            Ajouter des invités
          </Link>
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            className='rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple'
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className='mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger'>
          {error}
        </p>
      )}

      <div className='mt-8 max-w-xl rounded-2xl border border-border-soft bg-panel p-6'>
        <label className='block'>
          <span className='text-sm font-medium text-ink'>Destinataires</span>
          <select
            value={audience}
            onChange={e => setAudience(e.target.value)}
            className='mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-purple'
          >
            {AUDIENCES.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <div>
          <span className='text-sm font-medium text-ink'>Canal d'envoi</span>
          <div className='mt-2 grid grid-cols-3 gap-3'>
            {CHANNELS.map(c => (
              <button
                key={c}
                type='button'
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

        <label className='mt-6 block'>
          <span className='text-sm font-medium text-ink'>
            Message personnalisable
          </span>
          <textarea
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
            className='mt-2 w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30'
          />
          <div className='mt-2 flex flex-wrap gap-1.5'>
            {TAGS.map(tag => (
              <button
                key={tag}
                type='button'
                onClick={() => setMessage(current => `${current}${current.endsWith(' ') ? '' : ' '}{${tag}}`)}
                className='rounded-full bg-surface-2 px-2.5 py-1 font-mono text-xs text-muted hover:text-ink'
              >
                + {tag}
              </button>
            ))}
          </div>
        </label>

        <div className='mt-5'>
          <label className='block text-sm font-medium text-ink' htmlFor='share-guest'>
              Aperçu personnalisé pour
            </label>
          <select
            id='share-guest'
            value={selectedGuest?.id ?? ''}
            onChange={e => setSelectedGuestId(e.target.value)}
            className='mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-purple'
          >
            {shareGuests.map(guest => <option key={guest.id} value={guest.id}>{sentIds.has(guest.id) ? '✓ ' : ''}{guest.fullName}</option>)}
          </select>
          <p className='mt-2 rounded-lg bg-surface-2 p-3 text-sm text-muted'>
            {personalizedPreview || 'Aucun invité éligible dans cette audience pour afficher un aperçu.'}
          </p>
          {locationResult?.eventId === selectedEventId && locationResult.error && (
            <p className='mt-2 text-xs text-danger'>Le lieu n'a pas pu être chargé pour l'aperçu.</p>
          )}
          {channel !== 'E-mail' && selectedGuest && (
            <div className='mt-3 space-y-2'>
              {shareUrl ? (
                <a
                  href={shareUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  onClick={markSentAndNext}
                  className={`block rounded-lg px-4 py-3 text-center text-sm font-semibold text-white ${channel === 'WhatsApp' ? 'bg-[#25D366]' : 'bg-brand-purple'}`}
                >
                  Envoyer à {selectedGuest.fullName} {channel === 'WhatsApp' ? 'sur WhatsApp' : 'par SMS'}
                </a>
              ) : (
                <p className='text-xs text-danger'>Pas de numéro pour {selectedGuest.fullName} : ajoutez-le dans Invités & RSVP.</p>
              )}
              {channel === 'WhatsApp' && !internationalNumber(selectedGuest.phone) && (
                <p className='text-xs text-faint'>Pas de numéro enregistré : WhatsApp vous laissera choisir le contact.</p>
              )}
              <p className='flex flex-wrap items-center justify-between gap-2 text-xs text-muted'>
                <span>
                  {sentCount} / {shareGuests.length} invité{shareGuests.length > 1 ? 's' : ''} contacté{sentCount > 1 ? 's' : ''} · le suivant s’affiche tout seul
                </span>
                {sentCount > 0 && (
                  <button type='button' onClick={() => saveSent(new Set())} className='font-medium text-brand-purple hover:underline'>
                    Tout reprendre
                  </button>
                )}
              </p>
            </div>
          )}
        </div>

        <dl className='mt-6 grid grid-cols-2 gap-4 border-t border-border-soft pt-5'>
          {stats.map(stat => (
            <div key={stat.label}>
              <dt className='text-xs text-faint'>{stat.label}</dt>
              <dd className='mt-1 font-mono text-lg font-semibold text-ink'>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className='mt-4 text-xs text-faint'>
          {channel === 'E-mail'
            ? "Envoie un e-mail réel à chaque invité disposant d'une adresse e-mail."
            : `Les messages ${channel} partent de votre téléphone, un invité après l'autre, chacun avec son lien personnel.`}
        </p>

        {channel === 'E-mail' && (
          <Button
            variant='gradient'
            className='mt-4 w-full disabled:opacity-70'
            disabled={sending || emailRecipients.length === 0}
            onClick={handleSend}
          >
            {sending ? 'Envoi...' : 'Envoyer par e-mail'}
          </Button>
        )}
        {sendResult?.channel === 'E-mail' && sendResult.emailsSentCount > 0 && (
          <p role='status' className='mt-3 text-center text-sm text-success'>
            {sendResult.emailsSentCount} e-mail(s) accepté(s) par le service
            d'envoi sur {sendResult.emailRecipientCount} adresse(s). La
            livraison finale dépend du fournisseur de messagerie.
          </p>
        )}
        {sendResult?.channel === 'E-mail' && sendResult.emailsSentCount === 0 && (
          <p role='alert' className='mt-3 text-center text-sm text-danger'>
            {sendResult.emailRecipientCount === 0
              ? 'Aucun e-mail envoyé : aucun invité ne possède d’adresse e-mail enregistrée.'
              : sendResult.deliveryError ??
                'Aucun e-mail accepté par le service d’envoi. Consultez les journaux du backend.'}
          </p>
        )}
        {sendResult && sendResult.channel !== 'E-mail' && (
          <p role='status' className='mt-3 text-center text-sm text-muted'>
            Brouillon enregistré pour {sendResult.recipientCount} invité(s).
            Aucun message n'a été envoyé automatiquement.
          </p>
        )}
      </div>
    </DashboardLayout>
  )
}
