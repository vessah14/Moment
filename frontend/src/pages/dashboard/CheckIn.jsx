import jsQR from 'jsqr'
import { FileDown, QrCode, Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import StatCard from '../../components/dashboard/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { listEvents } from '../../api/events'
import { checkInGuest, listGuests, undoCheckInGuest } from '../../api/guests'
import { guestStatusLabel } from '../../utils/guestStatus'
import { cacheGuestList, dequeueCheckin, enqueueCheckin, flushQueue, isNetworkError, readGuestList, readQueue, withQueued } from '../../utils/offlineCheckins'
import { arrivalTime, downloadAttendanceCsv, downloadAttendancePdf } from '../../utils/attendanceSheet'

function formatTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Résultat en grand pour l'hôtesse, avec une forme par cas (lisible sans les couleurs) :
// rond vert « Bienvenue », carré arrondi orange « Déjà enregistré », carré rouge « inconnu ».
const RESULT_LOOK = {
  ok: { title: 'Bienvenue', icon: '✓', badge: 'rounded-full bg-success', text: 'text-success' },
  deja: { title: 'Déjà enregistré', icon: '!', badge: 'rounded-xl bg-brand-orange', text: 'text-brand-orange' },
  inconnu: { title: 'QR code inconnu', icon: '×', badge: 'rounded bg-danger', text: 'text-danger' },
}

function ScanResult({ result }) {
  const look = RESULT_LOOK[result.kind]
  const g = result.guest
  const detail =
    result.kind === 'inconnu'
      ? 'Ce code ne correspond à aucun invité de cet événement. Cherchez le nom ci-dessus.'
      : [
          g.side,
          result.kind === 'ok' && g.extra !== null && g.extra !== undefined && `cocktail : ${g.extra ? 'oui' : 'non'}`,
          `${result.kind === 'ok' ? 'enregistré(e)' : 'arrivé(e)'} à ${formatTime(g.checkedInAt)}`,
          g.seats > 1 && `${g.seats} places`,
        ]
          .filter(Boolean)
          .join(' · ')
  return (
    <div key={`${result.kind}-${g?.id ?? ''}-${g?.checkedInAt ?? ''}`} className="flex gap-3 rounded-2xl border border-border-soft bg-surface p-4">
      <span className={`grid h-11 w-11 shrink-0 place-items-center text-2xl font-bold text-white ${look.badge}`} aria-hidden="true">
        {look.icon}
      </span>
      <div className="min-w-0">
        <p className={`text-xs font-semibold ${look.text}`}>{look.title}</p>
        {g && <p className="truncate text-lg font-bold text-ink">{g.fullName}</p>}
        <p className="text-sm text-muted">{detail}</p>
        {g?.status === 'Absent' && <p className="mt-1 text-xs text-brand-orange">Attention : cet invité avait décliné l'invitation.</p>}
        {g?.pendingSync && <p className="mt-1 text-xs text-faint">Gardé sur ce téléphone, envoyé au retour du réseau.</p>}
      </div>
    </div>
  )
}

export default function CheckIn() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
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
  const rafRef = useRef(null)
  const guestsRef = useRef(guests)
  const handleCheckInRef = useRef(null)
  const lastScannedRef = useRef({ id: null, at: 0 })

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

  const reloadGuests = (eventId) => {
    setLoading(true)
    listGuests(eventId)
      .then((data) => {
        setGuests(withQueued(data ?? [], readQueue(eventId)))
        setOfflineSince('')
        setError('')
      })
      .catch((err) => {
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
    if (selectedEventId && guests.length) cacheGuestList(selectedEventId, guests)
  }, [guests, selectedEventId])

  // Entrées gardées sur ce téléphone pendant une coupure : envoyées au retour du réseau,
  // puis toutes les 15 s tant qu'il en reste.
  const queuedCount = guests.filter((g) => g.pendingSync).length
  useEffect(() => {
    if (!selectedEventId || !queuedCount) return undefined
    let running = false
    const flush = async () => {
      if (running) return
      running = true
      const sent = await flushQueue(selectedEventId, checkInGuest)
      running = false
      if (!sent.length) return
      const done = new Map(sent.map((s) => [s.guestId, s.guest]))
      setGuests((prev) => prev.map((g) => (done.has(g.id) ? done.get(g.id) ?? { ...g, pendingSync: false } : g)))
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
    .filter((g) => g.checkedInAt)
    .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt))
  const pending = guests.filter((g) => !g.checkedInAt)
  const expected = guests.filter((g) => g.status !== 'Absent')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return pending
      .filter(
        (g) =>
          g.fullName.toLowerCase().includes(q) ||
          (g.email ?? '').toLowerCase().includes(q) ||
          (g.phone ?? '').toLowerCase().includes(q),
      )
      .slice(0, 8)
  }, [pending, query])

  const handleCheckIn = async (guest) => {
    setCheckingId(guest.id)
    setError('')
    try {
      const updated = await checkInGuest(guest.id)
      setGuests((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
      setResult({ kind: updated.alreadyCheckedIn ? 'deja' : 'ok', guest: updated })
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
      setGuests((prev) => prev.map((g) => (g.id === guest.id ? local : g)))
      setResult({ kind: 'ok', guest: local })
      setQuery('')
    } finally {
      setCheckingId('')
    }
  }

  const handleUndo = async (guest) => {
    // Entrée pas encore envoyée : on la retire simplement de la file du téléphone.
    if (guest.pendingSync) {
      dequeueCheckin(selectedEventId, guest.id)
      setGuests((prev) => prev.map((g) => (g.id === guest.id ? { ...g, checkedInAt: null, pendingSync: false } : g)))
      if (result?.guest?.id === guest.id) setResult(null)
      return
    }
    setCheckingId(guest.id)
    setError('')
    try {
      const updated = await undoCheckInGuest(guest.id)
      setGuests((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
      if (result?.guest?.id === guest.id) setResult(null)
    } catch (err) {
      setError(err.message || "L'annulation a échoué.")
    } finally {
      setCheckingId('')
    }
  }

  useEffect(() => {
    handleCheckInRef.current = handleCheckIn
  })

  const stopScan = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setScanning(false)
  }, [])

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
      const isRepeat = code.data === lastScannedRef.current.id && now - lastScannedRef.current.at < 3000
      if (!isRepeat) {
        lastScannedRef.current = { id: code.data, at: now }
        const match = guestsRef.current.find((g) => g.id === code.data)
        if (!match) {
          setResult({ kind: 'inconnu' })
        } else if (match.checkedInAt) {
          setResult({ kind: 'deja', guest: match })
        } else {
          handleCheckInRef.current?.(match)
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const startScan = async () => {
    setScanError('')
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
      rafRef.current = requestAnimationFrame(tick)
    } catch {
      setScanError("Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur.")
    }
  }

  useEffect(() => stopScan, [stopScan])
  useEffect(() => {
    stopScan()
  }, [selectedEventId, stopScan])

  const STATS = [
    { label: 'Arrivés', value: String(attended.length), valueStyle: 'brand' },
    { label: 'Attendus', value: String(expected.length), hint: 'hors refus' },
    { label: 'Pas encore arrivés', value: String(pending.filter((g) => g.status !== 'Absent').length) },
  ]

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-ink">Check-in</h1>
        <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
          Créez d'abord un événement avec des invités pour utiliser le check-in.
        </p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Check-in</h1>
          <p className="mt-1.5 text-sm text-muted">
            Scannez le QR d'un invité ou recherchez-le par nom, email ou téléphone pour valider son entrée.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!guests.length}
          onClick={() => downloadAttendancePdf(events.find((ev) => ev.id === selectedEventId)?.name, guests)}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-ink hover:border-brand-purple disabled:opacity-40"
        >
          <FileDown className="h-4 w-4" />
          Feuille d'émargement (PDF)
        </button>
        <button
          type="button"
          disabled={!guests.length}
          onClick={() => downloadAttendanceCsv(events.find((ev) => ev.id === selectedEventId)?.name, guests)}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-ink hover:border-brand-purple disabled:opacity-40"
          title="Fichier CSV, ouvert directement par Excel"
        >
          <FileDown className="h-4 w-4" />
          Liste de présence (Excel)
        </button>
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
      </div>

      {offlineSince && (
        <p role="status" className="mt-6 rounded-lg border border-brand-orange/30 bg-brand-orange/10 px-4 py-2.5 text-sm text-ink">
          Pas de réseau : liste des invités gardée sur ce téléphone (enregistrée à {arrivalTime(offlineSince)}). Les QR restent
          vérifiés ; les entrées seront envoyées au retour du réseau.
        </p>
      )}
      {error && (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}
      {queuedCount > 0 && (
        <p role="status" className="mt-6 rounded-lg border border-brand-orange/30 bg-brand-orange/10 px-4 py-2.5 text-sm text-ink">
          Pas de réseau : {queuedCount} entrée{queuedCount > 1 ? 's' : ''} gardée{queuedCount > 1 ? 's' : ''} sur ce téléphone.
          Continuez à scanner ; l’envoi se fera dès le retour du réseau. Ne fermez pas cette page.
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-border-soft bg-panel p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, email ou téléphone…"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pr-4 pl-10 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
            />
          </div>

          {query.trim() && (
            <div className="mt-3 space-y-1.5">
              {results.length === 0 && (
                <p className="px-2 py-3 text-sm text-faint">Aucun invité en attente ne correspond.</p>
              )}
              {results.map((guest) => (
                <button
                  key={guest.id}
                  type="button"
                  disabled={checkingId === guest.id}
                  onClick={() => handleCheckIn(guest)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border-soft px-3 py-2.5 text-left transition hover:border-brand-purple disabled:opacity-60"
                >
                  <Avatar name={guest.fullName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{guest.fullName}{guest.seats > 1 && ` · ${guest.seats} places`}</p>
                    <p className="truncate text-xs text-faint">{guest.email}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-brand-purple">
                    {checkingId === guest.id ? '…' : 'Valider'}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 border-t border-border-soft pt-4">
            {!scanning ? (
              <button
                type="button"
                onClick={startScan}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-soft px-3 py-2.5 text-sm font-medium text-ink transition hover:border-brand-purple"
              >
                <QrCode className="h-4 w-4" />
                Scanner le QR d'un billet
              </button>
            ) : (
              <div>
                <div className="relative overflow-hidden rounded-lg bg-black">
                  <video ref={videoRef} muted playsInline className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    onClick={stopScan}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                    aria-label="Arrêter le scan"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
            {scanError && (
              <p className="mt-2 text-center text-xs text-danger">{scanError}</p>
            )}
          </div>

          <div role="status" aria-live="polite" className="mt-4">
            {result && <ScanResult result={result} />}
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border-soft bg-surface">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="font-semibold text-ink">Invités arrivés</h2>
              <span className="text-xs text-faint">{attended.length} / {expected.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-y border-border-soft text-xs tracking-wider text-faint uppercase">
                    <th className="px-6 py-3 font-medium">Invité</th>
                    <th className="px-3 py-3 font-medium">Arrivée</th>
                    <th className="px-3 py-3 font-medium">RSVP</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-faint">
                        Chargement…
                      </td>
                    </tr>
                  )}
                  {!loading && attended.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-faint">
                        Aucun invité pointé pour le moment.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    attended.map((guest) => (
                      <tr key={guest.id} className="border-b border-border-soft last:border-b-0">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={guest.fullName} />
                            <span className="font-medium text-ink">{guest.fullName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono text-muted">{formatTime(guest.checkedInAt)}</td>
                        <td className="px-3 py-3">
                          <StatusBadge status={guestStatusLabel(guest.status)} />
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            type="button"
                            disabled={checkingId === guest.id}
                            onClick={() => handleUndo(guest)}
                            className="text-xs text-faint hover:text-danger disabled:opacity-50"
                            title="Annuler le pointage (erreur de saisie)"
                          >
                            Annuler
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
