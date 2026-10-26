import { useEffect, useMemo, useState } from 'react'
import { listEvents } from '../api/events'
import { listEventCategories } from '../api/eventCategories'
import { listGuestStats } from '../api/guests'
import { getCurrentUser } from '../api/client'
import QuickActions from '../components/dashboard/QuickActions'
import RecentEventsTable from '../components/dashboard/RecentEventsTable'
import StatCard from '../components/dashboard/StatCard'
import DashboardLayout from '../components/layout/DashboardLayout'

export default function Dashboard() {
  const user = getCurrentUser()
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [guestStats, setGuestStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listEvents(), listEventCategories(), listGuestStats()])
      .then(([eventsData, categoriesData, guestStatsData]) => {
        setEvents(eventsData ?? [])
        setCategories(categoriesData ?? [])
        setGuestStats(guestStatsData ?? [])
      })
      .catch((err) => setError(err.message || 'Impossible de charger le tableau de bord.'))
      .finally(() => setLoading(false))
  }, [])

  const categoryLabel = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.label]))
    return (categoryId) => map.get(categoryId) ?? '—'
  }, [categories])

  const guestStatsByEvent = useMemo(
    () => new Map(guestStats.map((stats) => [stats.eventId, stats])),
    [guestStats],
  )

  const activeEvents = events.filter((e) => e.status !== 'Archive')
  const publishedCount = activeEvents.filter((e) => e.status === 'Publie').length
  const draftCount = activeEvents.filter((e) => e.status === 'Brouillon').length
  const totalGuests = guestStats.reduce((total, stats) => total + stats.totalCount, 0)
  const confirmedGuests = guestStats.reduce((total, stats) => total + stats.confirmedCount, 0)
  const pendingGuests = guestStats.reduce((total, stats) => total + stats.pendingCount, 0)

  const nextEvent = useMemo(() => {
    const today = new Date()
    return activeEvents
      .filter((e) => e.eventDate && new Date(e.eventDate) >= today)
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))[0]
  }, [activeEvents])

  const daysUntilNext = nextEvent
    ? Math.ceil((new Date(nextEvent.eventDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  const recentEvents = useMemo(() => {
    return [...activeEvents]
      .sort((a, b) => new Date(b.eventDate ?? 0) - new Date(a.eventDate ?? 0))
      .slice(0, 5)
      .map((event) => {
        const eventGuests = guestStatsByEvent.get(event.id)
        return {
          id: event.id,
          name: event.name,
          category: categoryLabel(event.categoryId),
          date: event.eventDate,
          status: event.status,
          confirmed: eventGuests?.confirmedCount ?? 0,
          total: eventGuests?.totalCount ?? 0,
        }
      })
  }, [activeEvents, guestStatsByEvent, categoryLabel])

  const STATS = [
    { label: 'Événements', value: String(activeEvents.length), hint: `${publishedCount} publiés · ${draftCount} brouillon(s)` },
    { label: 'Invités', value: String(totalGuests) },
    {
      label: 'Confirmés',
      value: String(confirmedGuests),
      hint: totalGuests ? `${Math.round((confirmedGuests / totalGuests) * 100)}% de réponses` : undefined,
      valueStyle: 'brand',
    },
    { label: 'En attente', value: String(pendingGuests), valueStyle: 'brand' },
  ]

  const firstName = user?.fullName?.split(' ')[0] ?? ''

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">
            {firstName ? `Bonjour ${firstName}` : 'Bonjour'}
          </h1>
          <p className="mt-1.5 text-muted">
            {activeEvents.length} événement(s) actif(s)
            {nextEvent && daysUntilNext != null
              ? ` · le prochain dans ${daysUntilNext} jour(s)`
              : ''}
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {!loading && (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <RecentEventsTable events={recentEvents} loading={loading} />
        <QuickActions />
      </div>
    </DashboardLayout>
  )
}
