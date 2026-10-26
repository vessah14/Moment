import { FileDown } from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import StatCard from '../../components/dashboard/StatCard'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { listEvents } from '../../api/events'
import { listGuests } from '../../api/guests'
import { getEventStats } from '../../api/eventStats'
import { downloadCsv } from '../../utils/csv'
import { GUEST_STATUS_LABELS } from '../../utils/guestStatus'

const RsvpDonut = lazy(() => import('../../components/analytics/RsvpDonut'))
const VisitsChart = lazy(() => import('../../components/analytics/VisitsChart'))

export default function Analytics() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [stats, setStats] = useState(null)
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  useEffect(() => {
    if (!selectedEventId) return
    setLoading(true)
    Promise.all([getEventStats(selectedEventId), listGuests(selectedEventId)])
      .then(([statsData, guestsData]) => {
        setStats(statsData)
        setGuests(guestsData ?? [])
        setError('')
      })
      .catch((err) => setError(err.message || 'Impossible de charger les statistiques.'))
      .finally(() => setLoading(false))
  }, [selectedEventId])

  const visitsData = useMemo(
    () =>
      (stats?.daily ?? []).map((d) => ({
        day: d.date.slice(8, 10),
        visites: d.visits,
        partages: d.shares,
      })),
    [stats],
  )

  const rsvpData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'Confirmés', value: stats.confirmedGuests, color: 'var(--color-chart-green)' },
      { name: 'En attente', value: stats.pendingGuests, color: 'var(--color-chart-amber)' },
      { name: 'Refus', value: stats.refusedGuests, color: 'var(--color-chart-rose)' },
    ]
  }, [stats])

  const STATS = stats
    ? [
        { label: 'Invités', value: String(stats.totalGuests) },
        { label: 'Confirmés', value: String(stats.confirmedGuests), valueStyle: 'brand' },
        { label: 'Accompagnants', value: String(stats.totalAccompanying) },
        { label: 'Visites', value: String(stats.totalVisits) },
        { label: 'Partages', value: String(stats.totalShares) },
      ]
    : []

  const handleExportGuests = () => {
    downloadCsv(
      'participants.csv',
      ['Nom', 'Email', 'Téléphone', 'Statut'],
      guests.map((g) => [g.fullName, g.email, g.phone, GUEST_STATUS_LABELS[g.status] ?? g.status]),
    )
  }

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-ink">Statistiques</h1>
        <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
          Créez un événement pour voir ses statistiques.
        </p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Statistiques</h1>
          <p className="mt-1.5 text-sm text-muted">Données réelles de l'événement sélectionné</p>
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

      {!loading && stats && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border-soft bg-panel p-5">
              <h2 className="font-semibold text-ink">Visites et partages</h2>
              <Suspense fallback={<p role="status" className="mt-4 text-sm text-faint">Chargement du graphique…</p>}>
                <VisitsChart data={visitsData} />
              </Suspense>
            </div>

            <div className="rounded-2xl border border-border-soft bg-panel p-5">
              <h2 className="font-semibold text-ink">Répartition RSVP</h2>
              <Suspense fallback={<p role="status" className="mt-4 text-sm text-faint">Chargement du graphique…</p>}>
                <RsvpDonut data={rsvpData} />
              </Suspense>
              <div className="mt-2 space-y-2">
                {rsvpData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-mono text-muted">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border-soft bg-surface p-5">
            <h2 className="font-semibold text-ink">Export</h2>
            <button
              type="button"
              onClick={handleExportGuests}
              disabled={guests.length === 0}
              className="mt-4 flex items-center gap-3 rounded-lg border border-border-soft px-4 py-3 text-left text-sm text-ink transition hover:border-faint disabled:opacity-50"
            >
              <FileDown className="h-4 w-4 text-muted" />
              Participants · CSV
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
