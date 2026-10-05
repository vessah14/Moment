import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicInvitation, submitPublicRsvp } from '../api/guests'
import logoMark from '../assets/logo-mark.png'
import Button from '../components/ui/Button'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'

function formatEventDateTime(dateStr, timeStr) {
  if (!dateStr) return ''
  const date = new Date(`${dateStr}T${timeStr ?? '00:00:00'}`)
  const datePart = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  if (!timeStr) return datePart
  const timePart = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${datePart} à ${timePart}`
}

function buildIcs(invitation) {
  const dateStr = invitation.eventDate ?? ''
  const timeStr = invitation.eventStartTime ?? '00:00:00'
  const start = `${dateStr.replaceAll('-', '')}T${timeStr.replaceAll(':', '').padEnd(6, '0')}`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${invitation.eventName}`,
    dateStr ? `DTSTART:${start}` : null,
    invitation.locationAddress ? `LOCATION:${invitation.locationAddress}` : null,
    `DESCRIPTION:Invitation pour ${invitation.guestFullName}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)
  return lines.join('\r\n')
}

export default function GuestInvitation() {
  const { code: guestId } = useParams()
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [accompanyingCount, setAccompanyingCount] = useState(0)
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [shareMessage, setShareMessage] = useState('')

  useEffect(() => {
    getPublicInvitation(guestId)
      .then((data) => {
        setInvitation(data)
        setAccompanyingCount(data.rsvpAccompanyingCount ?? 0)
      })
      .catch((err) => setError(err.message || 'Invitation introuvable.'))
      .finally(() => setLoading(false))
  }, [guestId])

  useEffect(() => {
    if (invitation?.rsvpConfirmed !== true) return
    QRCode.toDataURL(guestId, { margin: 1, width: 240 }).then(setQrDataUrl)
  }, [invitation?.rsvpConfirmed, guestId])

  const handleRsvp = async (confirmed) => {
    setSubmitting(true)
    setError('')
    try {
      const result = await submitPublicRsvp(guestId, {
        confirmed,
        accompanyingCount: confirmed ? accompanyingCount : 0,
        message: null,
      })
      setInvitation(result)
    } catch (err) {
      setError(err.message || "La réponse n'a pas pu être enregistrée.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveQr = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `billet-${guestId.slice(0, 8)}.png`
    link.click()
  }

  const handleAddToCalendar = () => {
    if (!invitation) return
    const blob = new Blob([buildIcs(invitation)], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${invitation.eventName}.ics`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleItinerary = () => {
    if (!invitation?.locationAddress) return
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.locationAddress)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const handleShare = async () => {
    const shareData = {
      title: invitation?.eventName,
      text: `Vous êtes invité(e) à ${invitation?.eventName}.`,
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // Utilisateur a annulé le partage
      }
      return
    }
    await navigator.clipboard.writeText(window.location.href)
    setShareMessage('Lien copié !')
    setTimeout(() => setShareMessage(''), 2500)
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-bg px-6 py-12">
        <p className="text-sm text-faint">Chargement de l'invitation…</p>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-bg px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <img src={logoMark} alt="" className="mx-auto h-10 w-10 opacity-80" />
          <h1 className="mt-6 text-xl font-bold text-ink">Invitation introuvable</h1>
          <p className="mt-2 text-sm text-muted">
            {error || "Ce lien n'est plus valide."}
          </p>
        </div>
      </div>
    )
  }

  const rsvp =
    invitation.rsvpConfirmed === true ? 'confirmed' : invitation.rsvpConfirmed === false ? 'declined' : null
  const seats = 1 + (invitation.rsvpAccompanyingCount ?? 0)
  // Événement passé : la réponse ne peut plus être modifiée (refusé aussi côté serveur).
  const closed = Boolean(invitation.rsvpClosed)

  return (
    <div className="flex min-h-svh items-center justify-center bg-bg px-6 py-12">
      <LanguageSwitcher floating />
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border-soft bg-surface">
        <div className="flex items-center gap-2 border-b border-border-soft px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-pink" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-purple" />
          <span className="ml-2 truncate font-mono text-xs text-faint">
            {invitation.eventName}
          </span>
        </div>

        <div className="flex aspect-video items-center justify-center bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-panel))]">
          <img src={logoMark} alt="" className="h-10 w-10 opacity-80" />
        </div>

        <div className="p-6">
          {error && (
            <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {error}
            </p>
          )}

          {rsvp === null && closed && (
            <div className="rounded-lg border border-border-soft bg-surface-2 p-4">
              <p className="font-semibold text-ink">Les réponses sont closes</p>
              <p className="mt-1 text-sm text-muted">
                {invitation.eventName} a déjà eu lieu. Merci de votre intérêt !
              </p>
            </div>
          )}

          {rsvp === null && !closed && (
            <>
              <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[11px] font-semibold tracking-widest text-brand-purple uppercase">
                Invitation personnelle
              </span>
              <h1 className="mt-4 text-2xl font-bold text-ink">{invitation.guestFullName}</h1>
              <p className="mt-3 text-sm text-muted">
                Vous êtes invité(e) à {invitation.eventName}
                {invitation.eventDate ? `, le ${formatEventDateTime(invitation.eventDate, invitation.eventStartTime)}` : ''}
                {invitation.locationAddress ? `, ${invitation.locationAddress}` : ''}.
              </p>

              <label className="mt-5 block">
                <span className="text-sm font-medium text-ink">Accompagnants</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={accompanyingCount}
                  onChange={(e) =>
                    setAccompanyingCount(Math.min(20, Math.max(0, Number(e.target.value) || 0)))
                  }
                  className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
                />
              </label>

              <div className="mt-5 space-y-3">
                <Button
                  variant="gradient"
                  className="w-full disabled:opacity-70"
                  disabled={submitting}
                  onClick={() => handleRsvp(true)}
                >
                  Je confirme ma présence
                </Button>
                <Button
                  variant="outline"
                  className="w-full disabled:opacity-70"
                  disabled={submitting}
                  onClick={() => handleRsvp(false)}
                >
                  Je ne pourrai pas venir
                </Button>
              </div>
            </>
          )}

          {rsvp === 'confirmed' && (
            <>
              <div className="rounded-lg border border-success/30 bg-success/10 p-4">
                <p className="font-semibold text-success">Présence confirmée</p>
                <p className="mt-1 text-sm text-ink">
                  {invitation.guestFullName}
                  {seats > 1 ? ` + ${seats - 1} accompagnant${seats - 1 > 1 ? 's' : ''}` : ''}
                </p>
              </div>

              <div className="mt-5 flex aspect-square items-center justify-center rounded-lg bg-white p-4">
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR code du billet" className="h-full w-full" />
                )}
              </div>

              <p className="mt-3 text-center font-mono text-sm text-ink">
                {guestId.slice(0, 8).toUpperCase()}
              </p>
              <p className="mt-1 text-center text-xs text-faint">
                À présenter à l'entrée.
              </p>

              <div className="mt-5 space-y-3">
                <Button variant="outline" className="w-full" onClick={handleSaveQr}>
                  Enregistrer le QR
                </Button>
                {!closed && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleRsvp(false)}
                    className="w-full text-sm text-muted hover:text-ink hover:underline"
                  >
                    Je ne peux finalement plus venir
                  </button>
                )}
              </div>
            </>
          )}

          {rsvp === 'declined' && (
            <>
              <div className="rounded-lg border border-border-soft bg-surface-2 p-4">
                <p className="font-semibold text-ink">Réponse enregistrée</p>
                <p className="mt-1 text-sm text-muted">
                  Merci de nous avoir prévenus, vous nous manquerez le jour J.
                </p>
              </div>
              {!closed && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRsvp(true)}
                  className="mt-4 text-sm text-brand-purple hover:underline"
                >
                  Changer ma réponse
                </button>
              )}
            </>
          )}

          <div className="mt-6 flex items-center justify-center gap-4 border-t border-border-soft pt-4 text-xs text-faint">
            <button type="button" onClick={handleAddToCalendar} className="hover:text-ink">
              Calendrier
            </button>
            {invitation.locationAddress && (
              <button type="button" onClick={handleItinerary} className="hover:text-ink">
                Itinéraire
              </button>
            )}
            <button type="button" onClick={handleShare} className="hover:text-ink">
              {shareMessage || 'Partager'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
