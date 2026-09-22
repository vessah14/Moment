import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import logoMark from '../assets/logo-mark.png'
import Button from '../components/ui/Button'
import { INITIAL_GUESTS } from '../data/guests'
import { slugify } from '../utils/slugify'
import { useLocalStorageState } from '../utils/useLocalStorageState'

const EVENT_LABEL = 'Mariage de Awa & Ibrahim'
const EVENT_LOCATION = 'Dakar, Sénégal'

function accompCount(accomp) {
  if (!accomp || accomp === '–') return 0
  return Number(accomp.replace('+', '')) || 0
}

function buildIcs(ticketCode) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${EVENT_LABEL}`,
    'DTSTART:20270314T160000',
    'DTEND:20270315T010000',
    `LOCATION:${EVENT_LOCATION}`,
    `DESCRIPTION:Billet ${ticketCode}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

export default function GuestInvitation() {
  const { code } = useParams()
  const [guests] = useLocalStorageState('tbf_guests_v2', INITIAL_GUESTS)
  const guest = guests.find((g) => slugify(g.name) === code) ?? guests[0]
  const ticketCode = `TBF-2027-${code ? code.slice(0, 6).toUpperCase() : 'DEMO01'}`
  const seats = 1 + accompCount(guest.accomp)

  const [rsvp, setRsvp] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [shareMessage, setShareMessage] = useState('')

  useEffect(() => {
    if (rsvp !== 'confirmed') return
    QRCode.toDataURL(ticketCode, { margin: 1, width: 240 }).then(setQrDataUrl)
  }, [rsvp, ticketCode])

  const handleSaveQr = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `billet-${ticketCode}.png`
    link.click()
  }

  const handleAddToCalendar = () => {
    const blob = new Blob([buildIcs(ticketCode)], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'mariage-awa-ibrahim.ics'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleItinerary = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT_LOCATION)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const handleShare = async () => {
    const shareData = {
      title: EVENT_LABEL,
      text: `Vous êtes invité(e) au mariage d'Awa & Ibrahim, le 14 mars 2027 à Dakar.`,
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

  return (
    <div className="flex min-h-svh items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border-soft bg-surface">
        <div className="flex items-center gap-2 border-b border-border-soft px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-pink" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-purple" />
          <span className="ml-2 truncate font-mono text-xs text-faint">
            tbfmoment.com/awa-ibrahim/i/{code}
          </span>
        </div>

        <div className="flex aspect-video items-center justify-center bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-panel))]">
          <img src={logoMark} alt="" className="h-10 w-10 opacity-80" />
        </div>

        <div className="p-6">
          {rsvp === null && (
            <>
              <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[11px] font-semibold tracking-widest text-brand-purple uppercase">
                Invitation personnelle
              </span>
              <h1 className="mt-4 text-2xl font-bold text-ink">{guest.name}</h1>
              <p className="mt-3 text-sm text-muted">
                Awa & Ibrahim ont le plaisir de vous convier le 14 mars 2027 à
                16:00, à Dakar.
              </p>
              <p className="mt-4 border-t border-border-soft pt-4 text-sm text-faint">
                Table réservée : {seats} place{seats > 1 ? 's' : ''}
              </p>

              <div className="mt-5 space-y-3">
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={() => setRsvp('confirmed')}
                >
                  Je confirme ma présence
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setRsvp('declined')}
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
                  {guest.name}
                  {seats > 1 ? ` + ${seats - 1} accompagnant${seats - 1 > 1 ? 's' : ''}` : ''}.
                  Modifiable jusqu'au 1er mars.
                </p>
              </div>

              <div className="mt-5 flex aspect-square items-center justify-center rounded-lg bg-white p-4">
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR code du billet" className="h-full w-full" />
                )}
              </div>

              <p className="mt-3 text-center font-mono text-sm text-ink">
                {ticketCode}
              </p>
              <p className="mt-1 text-center text-xs text-faint">
                À présenter à l'entrée. Un seul scan autorisé par billet.
              </p>

              <div className="mt-5 space-y-3">
                <Button variant="outline" className="w-full" onClick={handleSaveQr}>
                  Enregistrer le QR
                </Button>
                <Button as={Link} to="/builder" variant="outline" className="w-full">
                  Voir la page de l'événement
                </Button>
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
              <button
                type="button"
                onClick={() => setRsvp(null)}
                className="mt-4 text-sm text-brand-purple hover:underline"
              >
                Changer ma réponse
              </button>
            </>
          )}

          <div className="mt-6 flex items-center justify-center gap-4 border-t border-border-soft pt-4 text-xs text-faint">
            <button type="button" onClick={handleAddToCalendar} className="hover:text-ink">
              Calendrier
            </button>
            <button type="button" onClick={handleItinerary} className="hover:text-ink">
              Itinéraire
            </button>
            <button type="button" onClick={handleShare} className="hover:text-ink">
              {shareMessage || 'Partager'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
