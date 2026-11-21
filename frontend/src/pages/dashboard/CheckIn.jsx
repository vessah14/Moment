import jsQR from 'jsqr'
import {
  CalendarDays,
  ChevronDown,
  FileDown,
  Flashlight,
  QrCode,
  Search,
  SwitchCamera,
  X
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { pickCurrentEvent, useCurrentEventId } from '../../utils/currentEvent'
import Avatar from '../../components/ui/Avatar'
import StatusBadge from '../../components/ui/StatusBadge'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { listEvents } from '../../api/events'
import { eventType as getEventType } from '../../data/eventTypes'
import { checkInGuest, listGuests, undoCheckInGuest } from '../../api/guests'
import { guestStatusLabel } from '../../utils/guestStatus'
import {
  cacheGuestList,
  dequeueCheckin,
  enqueueCheckin,
  flushQueue,
  isNetworkError,
  readGuestList,
  readQueue,
  withQueued
} from '../../utils/offlineCheckins'
import {
  arrivalTime,
  downloadAttendanceCsv,
  downloadAttendancePdf
} from '../../utils/attendanceSheet'
import Pagination from '../../components/ui/Pagination'
import { usePagination } from '../../utils/pagination'
import { useToast } from '../../utils/useToast'
import { locale as uiLocale } from '../../i18n'

function formatTime (value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString(uiLocale, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function eventTypeOf (event) {
  try {
    const fields = typeof event?.customFields === 'string'
      ? JSON.parse(event.customFields || '{}')
      : event?.customFields
    return getEventType(fields?.eventType)
  } catch {
    return null
  }
}

function eventDateLabel (event) {
  if (!event?.eventDate) return 'Date à définir'
  const date = new Date(`${event.eventDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return event.eventDate
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowKey = `${tomorrow.getFullYear()}-${tomorrow.getMonth()}-${tomorrow.getDate()}`
  if (dateKey === todayKey) return "Aujourd'hui"
  if (dateKey === tomorrowKey) return 'Demain'
  return date.toLocaleDateString(uiLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

// Résultat en grand pour l'hôtesse, avec une forme par cas (lisible sans les couleurs) :
// rond vert « Bienvenue », carré arrondi orange « Déjà enregistré », carré rouge « inconnu ».
const RESULT_LOOK = {
  ok: {
    title: 'Bienvenue',
    icon: '✓',
    badge: 'rounded-full bg-success',
    text: 'text-success'
  },
  deja: {
    title: 'Déjà enregistré',
    icon: '!',
    badge: 'rounded-xl bg-brand-orange',
    text: 'text-brand-orange'
  },
  inconnu: {
    title: 'QR code inconnu',
    icon: '×',
    badge: 'rounded bg-danger',
    text: 'text-danger'
  }
}

function ScanResult ({ result }) {
  const look = RESULT_LOOK[result.kind]
  const g = result.guest
  const detail =
    result.kind === 'inconnu'
      ? 'Ce code ne correspond à aucun invité de cet événement. Cherchez le nom ci-dessus.'
      : [
          g.side,
          result.kind === 'ok' &&
            g.extra !== null &&
            g.extra !== undefined &&
            `cocktail : ${g.extra ? 'oui' : 'non'}`,
          `${
            result.kind === 'ok' ? 'enregistré(e)' : 'arrivé(e)'
          } à ${formatTime(g.checkedInAt)}`,
          g.seats > 1 && `${g.seats} places`
        ]
          .filter(Boolean)
          .join(' · ')
  return (
    <div
      key={`${result.kind}-${g?.id ?? ''}-${g?.checkedInAt ?? ''}`}
      className='flex gap-3 rounded-2xl border border-border-soft bg-surface p-4'
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center text-2xl font-bold text-white ${look.badge}`}
        aria-hidden='true'
      >
        {look.icon}
      </span>
      <div className='min-w-0'>
        <p className={`text-xs font-semibold ${look.text}`}>{look.title}</p>
        {g && (
          <p className='truncate text-lg font-bold text-ink'>{g.fullName}</p>
        )}
        <p className='text-sm text-muted'>{detail}</p>
        {g?.status === 'Absent' && (
          <p className='mt-1 text-xs text-brand-orange'>
            Attention : cet invité avait décliné l'invitation.
          </p>
        )}
        {g?.pendingSync && (
          <p className='mt-1 text-xs text-faint'>
            Gardé sur ce téléphone, envoyé au retour du réseau.
          </p>
        )}
      </div>
    </div>
  )
}

export default function CheckIn () {
  const toast = useToast()
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useCurrentEventId()
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  // Dernier scan ou dernière recherche : { kind: 'ok' | 'deja' | 'inconnu', guest }.
  const [result, setResult] = useState(null)
  // Liste lue sur ce téléphone faute de réseau à l'ouverture : date de la sauvegarde.
  const [offlineSince, setOfflineSince] = useState('')
  const [checkingId, setCheckingId] = useState('')

  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [facingMode, setFacingMode] = useState('environment')
  const [torch, setTorch] = useState({ available: false, on: false })
  const [canFlip, setCanFlip] = useState(false)
  const rafRef = useRef(null)
  const guestsRef = useRef(guests)
  const handleCheckInRef = useRef(null)
  const announceScanRef = useRef(null)
  const lastScannedRef = useRef({ id: null, at: 0 })

  const announceScan = (message, variant = 'success') => {
    toast(message, { variant, duration: 3500 })
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(
        variant === 'success' ? 80 : variant === 'warning' ? [45, 50, 45] : 180
      )
    }
  }

  useEffect(() => {
    listEvents()
      .then(data => {
        setEvents(data ?? [])
        if (data?.length) setSelectedEventId(pickCurrentEvent(data))
        else setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Impossible de charger vos événements.')
        setLoading(false)
      })
  }, [setSelectedEventId])

  const reloadGuests = eventId => {
    setLoading(true)
    listGuests(eventId)
      .then(data => {
        setGuests(withQueued(data ?? [], readQueue(eventId)))
        setOfflineSince('')
        setError('')
      })
      .catch(err => {
        // Pas de réseau : la liste gardée sur ce téléphone permet de continuer à scanner.
        const saved = isNetworkError(err) ? readGuestList(eventId) : null
        if (saved) {
          setGuests(withQueued(saved.guests, readQueue(eventId)))
          setOfflineSince(saved.savedAt)
          setError('')
        } else setError(err.message || 'Impossible de charger les invités.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedEventId) return
    reloadGuests(selectedEventId)
  }, [selectedEventId])

  useEffect(() => {
    guestsRef.current = guests
    if (selectedEventId && guests.length)
      cacheGuestList(selectedEventId, guests)
  }, [guests, selectedEventId])

  // Entrées gardées sur ce téléphone pendant une coupure : envoyées au retour du réseau,
  // puis toutes les 15 s tant qu'il en reste.
  const queuedCount = guests.filter(g => g.pendingSync).length
  useEffect(() => {
    if (!selectedEventId || !queuedCount) return undefined
    let running = false
    const flush = async () => {
      if (running) return
      running = true
      const sent = await flushQueue(selectedEventId, checkInGuest)
      running = false
      if (!sent.length) return
      const done = new Map(sent.map(s => [s.guestId, s.guest]))
      setGuests(prev =>
        prev.map(g =>
          done.has(g.id) ? done.get(g.id) ?? { ...g, pendingSync: false } : g
        )
      )
    }
    flush()
    window.addEventListener('online', flush)
    const timer = setInterval(flush, 15000)
    return () => {
      window.removeEventListener('online', flush)
      clearInterval(timer)
    }
  }, [selectedEventId, queuedCount])

  // Arrivée = pointage du jour J (checkedInAt), pas la réponse RSVP : un invité qui a
  // confirmé sa venue n'est pas encore arrivé.
  const attended = guests
    .filter(g => g.checkedInAt)
    .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt))
  const pending = guests.filter(g => !g.checkedInAt)
  // Jour J : des centaines d'arrivées ; seule une page est rendue à chaque scan.
  const arrivedPage = usePagination(
    attended,
    'tbf_page_size_checkin',
    selectedEventId
  )
  const expected = guests.filter(g => g.status !== 'Absent')
  const eventTypeOptions = useMemo(() => {
    const seen = new Map()
    events.forEach(event => {
      const type = eventTypeOf(event)
      if (type && !seen.has(type.id)) seen.set(type.id, type)
    })
    return [...seen.values()]
  }, [events])
  const visibleEvents = eventTypeFilter === 'all'
    ? events
    : events.filter(event => eventTypeOf(event)?.id === eventTypeFilter)
  const selectedEvent = events.find(event => event.id === selectedEventId)
  const selectedEventType = selectedEvent ? eventTypeOf(selectedEvent) : null
  const arrivalProgress = expected.length
    ? Math.min(100, (attended.length / expected.length) * 100)
    : 0

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return pending
      .filter(
        g =>
          g.fullName.toLowerCase().includes(q) ||
          (g.email ?? '').toLowerCase().includes(q) ||
          (g.phone ?? '').toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [pending, query])

  const handleCheckIn = async (guest, scanned = false) => {
    setCheckingId(guest.id)
    setError('')
    try {
      const updated = await checkInGuest(guest.id)
      setGuests(prev => prev.map(g => (g.id === updated.id ? updated : g)))
      setResult({
        kind: updated.alreadyCheckedIn ? 'deja' : 'ok',
        guest: updated
      })
      if (scanned)
        announceScan(
          updated.alreadyCheckedIn
            ? `Déjà enregistré : ${updated.fullName}`
            : `Entrée validée : ${updated.fullName}`,
          updated.alreadyCheckedIn ? 'warning' : 'success'
        )
      setQuery('')
    } catch (err) {
      if (!isNetworkError(err)) {
        setError(err.message || "L'enregistrement a échoué.")
        return
      }
      // Pas de réseau : le QR a déjà été reconnu sur ce téléphone, l'invité peut entrer.
      const at = new Date().toISOString()
      enqueueCheckin(selectedEventId, guest.id, at)
      const local = { ...guest, checkedInAt: at, pendingSync: true }
      setGuests(prev => prev.map(g => (g.id === guest.id ? local : g)))
      setResult({ kind: 'ok', guest: local })
      if (scanned)
        announceScan(
          `Entrée enregistrée hors ligne : ${local.fullName}`,
          'warning'
        )
      setQuery('')
    } finally {
      setCheckingId('')
    }
  }

  const selectEventType = typeId => {
    setEventTypeFilter(typeId)
    if (typeId === 'all') return
    const firstEvent = events.find(event => eventTypeOf(event)?.id === typeId)
    if (firstEvent) setSelectedEventId(firstEvent.id)
  }

  const selectEvent = eventId => {
    setSelectedEventId(eventId)
    const type = eventTypeOf(events.find(event => event.id === eventId))
    setEventTypeFilter(type?.id ?? 'all')
  }

  const handleUndo = async guest => {
    // Entrée pas encore envoyée : on la retire simplement de la file du téléphone.
    if (guest.pendingSync) {
      dequeueCheckin(selectedEventId, guest.id)
      setGuests(prev =>
        prev.map(g =>
          g.id === guest.id
            ? { ...g, checkedInAt: null, pendingSync: false }
            : g
        )
      )
      if (result?.guest?.id === guest.id) setResult(null)
      return
    }

    setCheckingId(guest.id)
    setError('')
    try {
      const updated = await undoCheckInGuest(guest.id)
      setGuests(prev => prev.map(g => (g.id === updated.id ? updated : g)))
      if (result?.guest?.id === guest.id) setResult(null)
    } catch (err) {
      setError(err.message || "L'annulation a échoué.")
    } finally {
      setCheckingId('')
    }
  }

  useEffect(() => {
    handleCheckInRef.current = handleCheckIn
    announceScanRef.current = announceScan
  })

  const releaseCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setTorch({ available: false, on: false })
  }, [])

  const stopScan = useCallback(() => {
    releaseCamera()
    setScanning(false)
  }, [releaseCamera])

  const tick = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick)
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code?.data) {
      const now = Date.now()
      const isRepeat =
        code.data === lastScannedRef.current.id &&
        now - lastScannedRef.current.at < 3000
      if (!isRepeat) {
        lastScannedRef.current = { id: code.data, at: now }
        const match = guestsRef.current.find(g => g.id === code.data)
        if (!match) {
          setResult({ kind: 'inconnu' })
          announceScanRef.current?.('QR code inconnu', 'danger')
        } else if (match.checkedInAt) {
          setResult({ kind: 'deja', guest: match })
          announceScanRef.current?.(
            `Déjà enregistré : ${match.fullName}`,
            'warning'
          )
        } else {
          handleCheckInRef.current?.(match, true)
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  // facing : caméra arrière par défaut ; « Changer de caméra » passe à l'avant (ou l'inverse).
  const startScan = async (facing = facingMode) => {
    setScanError('')
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing }
      })
      streamRef.current = stream
      setFacingMode(facing)
      setScanning(true)
      // Lampe : seulement si le téléphone la propose pour cette caméra (Chrome Android).
      const track = stream.getVideoTracks()[0]
      setTorch({
        available: Boolean(track?.getCapabilities?.().torch),
        on: false
      })
      const devices = await navigator.mediaDevices
        .enumerateDevices?.()
        .catch(() => [])
      setCanFlip(
        (devices ?? []).filter(d => d.kind === 'videoinput').length > 1
      )
    } catch {
      setScanError(
        "Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur."
      )
    }
  }

  useEffect(() => {
    if (!scanning || !streamRef.current || !videoRef.current) return undefined
    const video = videoRef.current
    const stream = streamRef.current
    let cancelled = false
    video.srcObject = stream
    video.play()
      .then(() => {
        if (!cancelled) rafRef.current = requestAnimationFrame(tick)
      })
      .catch(() => {
        setScanError(
          "Impossible de démarrer la caméra. Vérifiez les autorisations de votre navigateur."
        )
        stopScan()
      })
    return () => {
      cancelled = true
      if (video.srcObject === stream) video.srcObject = null
    }
  }, [scanning, stopScan, tick])

  const flipCamera = () => {
    releaseCamera()
    setScanning(false)
    startScan(facingMode === 'environment' ? 'user' : 'environment')
  }

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    const on = !torch.on
    try {
      await track.applyConstraints({ advanced: [{ torch: on }] })
      setTorch({ available: true, on })
    } catch {
      setTorch({ available: false, on: false })
    }
  }

  useEffect(() => stopScan, [stopScan])
  useEffect(() => {
    stopScan()
  }, [selectedEventId, stopScan])

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className='text-2xl font-bold text-ink'>Check-in</h1>
        <p className='mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint'>
          Créez d'abord un événement avec des invités pour utiliser le check-in.
        </p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-5xl'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold text-ink'>Check-in</h1>
            <p className='mt-1.5 text-sm text-muted'>
              Accueillez vos invités en un scan ou retrouvez-les par leur nom.
            </p>
          </div>
          <div className='flex gap-2'>
            <button
              type='button'
              disabled={!guests.length}
              onClick={() =>
                downloadAttendancePdf(selectedEvent?.name, guests)
              }
              className='inline-flex min-h-10 items-center gap-2 rounded-xl border border-border-soft bg-surface px-3 text-sm font-medium text-ink transition hover:border-brand-purple disabled:opacity-40'
            >
              <FileDown className='h-4 w-4' />
              <span className='hidden sm:inline'>Feuille PDF</span>
              <span className='sm:hidden'>PDF</span>
            </button>
            <button
              type='button'
              disabled={!guests.length}
              onClick={() =>
                downloadAttendanceCsv(selectedEvent?.name, guests)
              }
              className='inline-flex min-h-10 items-center gap-2 rounded-xl border border-border-soft bg-surface px-3 text-sm font-medium text-ink transition hover:border-brand-purple disabled:opacity-40'
              title='Fichier CSV, ouvert directement par Excel'
            >
              <FileDown className='h-4 w-4' />
              <span className='hidden sm:inline'>Excel</span>
              <span className='sm:hidden'>CSV</span>
            </button>
          </div>
        </div>

        {offlineSince && (
          <p
            role='status'
            className='mt-6 rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-4 py-3 text-sm text-ink'
          >
            Pas de réseau : liste des invités gardée sur ce téléphone
            (enregistrée à {arrivalTime(offlineSince)}). Les QR restent
            vérifiés ; les entrées seront envoyées au retour du réseau.
          </p>
        )}
        {error && (
          <p className='mt-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger'>
            {error}
          </p>
        )}
        {queuedCount > 0 && (
          <p
            role='status'
            className='mt-4 rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-4 py-3 text-sm text-ink'
          >
            Pas de réseau : {queuedCount} entrée{queuedCount > 1 ? 's' : ''}{' '}
            gardée{queuedCount > 1 ? 's' : ''} sur ce téléphone. Continuez à
            scanner ; l’envoi se fera dès le retour du réseau. Ne fermez pas
            cette page.
          </p>
        )}

        <section
          aria-label="Filtrer par type d'événement"
          className='mt-7 rounded-2xl border border-brand-purple/15 bg-brand-purple/5 p-3 sm:p-4'
        >
          <p className='mb-2 px-1 text-xs font-semibold tracking-wide text-brand-purple'>
            Type d'événement
          </p>
          <div className='flex gap-2 overflow-x-auto pb-1'>
            <button
              type='button'
              aria-pressed={eventTypeFilter === 'all'}
              onClick={() => selectEventType('all')}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                eventTypeFilter === 'all'
                  ? 'bg-brand-purple text-white shadow-sm'
                  : 'border border-border-soft bg-surface text-muted hover:border-brand-purple'
              }`}
            >
              Tous
            </button>
            {eventTypeOptions.map(type => {
              const label = type.label.split(/[·,]/)[0].split(' et ')[0]
              return (
                <button
                  key={type.id}
                  type='button'
                  aria-pressed={eventTypeFilter === type.id}
                  onClick={() => selectEventType(type.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    eventTypeFilter === type.id
                      ? 'bg-brand-purple text-white shadow-sm'
                      : 'border border-border-soft bg-surface text-muted hover:border-brand-purple'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </section>

        <section className='mt-4 rounded-2xl border border-border-soft bg-surface p-4 shadow-sm sm:p-5'>
          <div className='flex items-center gap-3'>
            <span className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-purple/10 text-brand-purple'>
              <CalendarDays className='h-5 w-5' />
            </span>
            <div className='min-w-0 flex-1'>
              <p className='text-xs font-semibold text-brand-purple'>
                {selectedEventType?.label ?? "Événement d'accueil"}
              </p>
              <p className='truncate text-base font-bold text-ink'>
                {selectedEvent?.name ?? 'Choisissez un événement'}
              </p>
              <p className='mt-0.5 text-sm text-muted'>
                {[
                  eventDateLabel(selectedEvent),
                  selectedEvent?.startTime &&
                    `${String(selectedEvent.startTime).slice(0, 5)}`
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <ChevronDown
              className='h-5 w-5 shrink-0 text-faint'
              aria-hidden='true'
            />
          </div>
          <label className='mt-3 block'>
            <span className='sr-only'>Choisir un événement</span>
            <select
              value={selectedEventId}
              onChange={e => selectEvent(e.target.value)}
              className='w-full appearance-none rounded-xl border border-border-soft bg-panel px-3 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand-purple'
            >
              {visibleEvents.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className='mt-4'>
          {!scanning ? (
            <button
              type='button'
              disabled={loading || !selectedEventId}
              onClick={() => startScan()}
              className='flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] px-5 py-4 text-base font-bold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <QrCode className='h-6 w-6' />
              Scanner les billets
            </button>
          ) : (
            <div className='relative overflow-hidden rounded-2xl bg-black'>
              <video
                ref={videoRef}
                muted
                playsInline
                className='aspect-[4/3] max-h-[480px] w-full object-cover'
              />
              <button
                type='button'
                onClick={stopScan}
                className='absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80'
                aria-label='Arrêter le scan'
              >
                <X className='h-5 w-5' />
              </button>
              {(torch.available || canFlip) && (
                <div className='absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2'>
                  {torch.available && (
                    <button
                      type='button'
                      onClick={toggleTorch}
                      aria-pressed={torch.on}
                      aria-label={
                        torch.on ? 'Éteindre la lampe' : 'Allumer la lampe'
                      }
                      className={`rounded-full p-3 ${
                        torch.on
                          ? 'bg-amber-300 text-black'
                          : 'bg-black/60 text-white hover:bg-black/80'
                      }`}
                    >
                      <Flashlight className='h-5 w-5' />
                    </button>
                  )}
                  {canFlip && (
                    <button
                      type='button'
                      onClick={flipCamera}
                      aria-label='Changer de caméra'
                      className='rounded-full bg-black/60 p-3 text-white hover:bg-black/80'
                    >
                      <SwitchCamera className='h-5 w-5' />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          <canvas ref={canvasRef} className='hidden' aria-hidden='true' />
          {scanError && (
            <p className='mt-2 text-center text-sm text-danger'>{scanError}</p>
          )}
          <div role='status' aria-live='polite' className='mt-3'>
            {result && <ScanResult result={result} />}
          </div>
        </section>

        <section
          aria-label='Progression des arrivées'
          className='mt-4 rounded-2xl border border-border-soft bg-surface p-5 shadow-sm'
        >
          <div className='flex items-end justify-between gap-4'>
            <p className='text-3xl font-bold leading-none text-ink'>
              {attended.length}
              <span className='ml-1 text-lg font-medium text-faint'>
                / {expected.length}
              </span>
            </p>
            <p className='text-right text-sm text-muted'>
              <span className='font-semibold text-ink'>
                {pending.filter(g => g.status !== 'Absent').length}
              </span>{' '}
              encore attendus
            </p>
          </div>
          <div
            className='mt-4 h-2.5 overflow-hidden rounded-full bg-border-soft'
            role='progressbar'
            aria-label='Invités entrés'
            aria-valuemin={0}
            aria-valuemax={expected.length}
            aria-valuenow={Math.min(attended.length, expected.length)}
          >
            <div
              className='h-full rounded-full bg-brand-gradient transition-[width] duration-500'
              style={{ width: `${arrivalProgress}%` }}
            />
          </div>
          <p className='mt-2 text-xs text-muted'>personnes entrées</p>
        </section>

        <section className='mt-4'>
          <div className='relative'>
            <Search className='pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-faint' />
            <input
              type='search'
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Nom, téléphone ou e-mail'
              aria-label='Rechercher un invité par nom, téléphone ou e-mail'
              className='w-full rounded-2xl border border-border-soft bg-surface py-3 pl-11 pr-4 text-sm text-ink shadow-sm outline-none transition placeholder:text-faint focus:border-brand-purple'
            />
          </div>
          {query.trim() && (
            <div className='mt-2 space-y-1.5 rounded-2xl border border-border-soft bg-surface p-2'>
              {results.length === 0 && (
                <p className='px-3 py-3 text-sm text-faint'>
                  Aucun invité en attente ne correspond.
                </p>
              )}
              {results.map(guest => (
                <button
                  key={guest.id}
                  type='button'
                  disabled={checkingId === guest.id}
                  onClick={() => handleCheckIn(guest)}
                  className='flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-panel disabled:opacity-60'
                >
                  <Avatar name={guest.fullName} />
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold text-ink'>
                      {guest.fullName}
                      {guest.seats > 1 && ` · ${guest.seats} places`}
                    </p>
                    <p className='truncate text-xs text-faint'>{guest.email}</p>
                  </div>
                  <span className='shrink-0 text-xs font-semibold text-brand-purple'>
                    {checkingId === guest.id ? '…' : 'Valider'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className='mt-6 overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-sm'>
          <div className='flex items-center justify-between border-b border-border-soft px-4 py-4 sm:px-5'>
            <div>
              <h2 className='font-semibold text-ink'>Dernières arrivées</h2>
              <p className='mt-0.5 text-xs text-muted'>
                {attended.length} / {expected.length} personnes entrées
              </p>
            </div>
            <span className='text-xs font-medium uppercase tracking-wide text-faint'>
              {attended.length === 1 ? '1 arrivée' : `${attended.length} arrivées`}
            </span>
          </div>
          {loading && (
            <div className='space-y-3 p-4'>
              {[0, 1, 2].map(item => (
                <div
                  key={item}
                  className='h-14 animate-pulse rounded-xl bg-panel'
                />
              ))}
            </div>
          )}
          {!loading && attended.length === 0 && (
            <p className='px-5 py-10 text-center text-sm text-faint'>
              Aucune arrivée pour le moment. Scannez un billet ou recherchez un invité.
            </p>
          )}
          {!loading && attended.length > 0 && (
            <div className='divide-y divide-border-soft'>
              {arrivedPage.items.map(guest => (
                <div
                  key={guest.id}
                  className='flex items-center gap-3 px-4 py-3 sm:px-5'
                >
                  <Avatar name={guest.fullName} />
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold text-ink'>
                      {guest.fullName}
                    </p>
                    <p className='mt-0.5 text-xs text-muted'>
                      {formatTime(guest.checkedInAt)}
                      {guest.seats > 1 && ` · ${guest.seats} places`}
                      {guest.side && ` · ${guest.side}`}
                      {guest.pendingSync && ' · En attente de synchronisation'}
                    </p>
                  </div>
                  <div className='flex shrink-0 items-center gap-2'>
                    <StatusBadge status={guestStatusLabel(guest.status)} />
                    <button
                      type='button'
                      disabled={checkingId === guest.id}
                      onClick={() => handleUndo(guest)}
                      className='rounded-lg px-2 py-1 text-xs font-medium text-faint transition hover:bg-danger/10 hover:text-danger disabled:opacity-50'
                      title='Annuler le pointage (erreur de saisie)'
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination pagination={arrivedPage} label='arrivées' />
        </section>
      </div>
    </DashboardLayout>
  )
}
