import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import StatCard from '../../components/dashboard/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { listEvents } from '../../api/events'
import { listGuests, updateGuest } from '../../api/guests'
import { guestStatusLabel } from '../../utils/guestStatus'

export default function CheckIn() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [lastChecked, setLastChecked] = useState(null)
  const [checkingId, setCheckingId] = useState('')

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
        setGuests(data ?? [])
        setError('')
      })
      .catch((err) => setError(err.message || 'Impossible de charger les invités.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedEventId) return
    reloadGuests(selectedEventId)
  }, [selectedEventId])

  const attended = guests.filter((g) => g.status === 'Present')
  const pending = guests.filter((g) => g.status !== 'Present')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return pending
      .filter(
        (g) =>
          g.fullName.toLowerCase().includes(q) ||
          g.email.toLowerCase().includes(q) ||
          g.phone.toLowerCase().includes(q),
      )
      .slice(0, 8)
  }, [pending, query])

  const handleCheckIn = async (guest) => {
    setCheckingId(guest.id)
    setError('')
    try {
      await updateGuest(guest.id, {
        groupId: guest.groupId || null,
        fullName: guest.fullName,
        phone: guest.phone,
        email: guest.email,
        status: 'Present',
      })
      setLastChecked({ ...guest, status: 'Present' })
      setQuery('')
      reloadGuests(selectedEventId)
    } catch (err) {
      setError(err.message || "L'enregistrement a échoué.")
    } finally {
      setCheckingId('')
    }
  }

  const STATS = [
    { label: 'Présents', value: String(attended.length), valueStyle: 'brand' },
    { label: 'Attendus', value: String(guests.length) },
    { label: 'En attente', value: String(pending.length) },
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
            Recherchez un invité par nom, email ou téléphone pour valider son entrée.
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
                    <p className="truncate text-sm font-medium text-ink">{guest.fullName}</p>
                    <p className="truncate text-xs text-faint">{guest.email}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-brand-purple">
                    {checkingId === guest.id ? '…' : 'Valider'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {lastChecked && (
            <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-3">
              <p className="text-sm font-semibold text-success">Entrée validée</p>
              <p className="mt-1 text-sm text-ink">{lastChecked.fullName}</p>
            </div>
          )}
        </div>

        <div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border-soft bg-surface">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="font-semibold text-ink">Invités présents</h2>
              <span className="text-xs text-faint">{attended.length} / {guests.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-y border-border-soft text-xs tracking-wider text-faint uppercase">
                    <th className="px-6 py-3 font-medium">Invité</th>
                    <th className="px-3 py-3 font-medium">Contact</th>
                    <th className="px-3 py-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-sm text-faint">
                        Chargement…
                      </td>
                    </tr>
                  )}
                  {!loading && attended.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-sm text-faint">
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
                        <td className="px-3 py-3 text-muted">{guest.email}</td>
                        <td className="px-3 py-3">
                          <StatusBadge status={guestStatusLabel(guest.status)} />
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
