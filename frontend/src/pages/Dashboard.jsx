import { ArrowRight, CalendarPlus, Send, Share2, UserPlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listEvents } from '../api/events'
import { listEventCategories } from '../api/eventCategories'
import { listGuestStats } from '../api/guests'
import { getCurrentUser } from '../api/client'
import QuickActions from '../components/dashboard/QuickActions'
import RecentEventsTable from '../components/dashboard/RecentEventsTable'
import StatCard from '../components/dashboard/StatCard'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import { CREATE_EVENT_PATH, markFirstEventPrompted, wasFirstEventPrompted } from '../utils/firstEvent'

// Ce que l'organisateur doit faire maintenant pour son prochain événement : une seule
// action à la fois, pour qu'un nouveau client sache toujours où cliquer.
function nextStepFor(event, stats) {
  const name = `« ${event.name} »`
  if (event.status !== 'Publie')
    return { icon: Share2, title: `Publiez la page de ${name}`, text: 'Vérifiez-la, puis publiez-la pour pouvoir la partager.', cta: 'Terminer ma page', to: `/builder/${event.id}` }
  if (!stats?.totalCount)
    return { icon: UserPlus, title: `Ajoutez vos invités à ${name}`, text: 'Un par un ou en important votre liste Excel. Chacun aura son lien personnel et son pass.', cta: 'Ajouter mes invités', to: `/dashboard/participants?eventId=${encodeURIComponent(event.id)}&add=1` }
  if (stats.pendingCount > 0)
    return { icon: Send, title: `${stats.pendingCount} invité${stats.pendingCount > 1 ? 's n’ont' : ' n’a'} pas encore répondu`, text: 'Envoyez à chacun son invitation sur WhatsApp, en un geste par invité.', cta: 'Envoyer les invitations', to: '/dashboard/invitations' }
  return { icon: CalendarPlus, title: `Tout est prêt pour ${name}`, text: 'Le jour J, scannez les pass à l’entrée depuis votre téléphone.', cta: 'Préparer l’accueil', to: '/dashboard/checkin' }
}

export default function Dashboard() {
  const user = getCurrentUser()
  const navigate = useNavigate()
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

  // Aucun événement : un nouveau client part directement créer le sien (une fois par visite ;
  // s'il revient avec « Plus tard », il voit l'écran d'accueil ci-dessous).
  const noEvents = !loading && !error && activeEvents.length === 0
  useEffect(() => {
    if (!noEvents || wasFirstEventPrompted()) return
    markFirstEventPrompted()
    navigate(CREATE_EVENT_PATH, { replace: true })
  }, [noEvents, navigate])

  const focusEvent = nextEvent ?? recentEvents[0] ?? null
  const step = focusEvent ? nextStepFor(activeEvents.find((e) => e.id === focusEvent.id) ?? focusEvent, guestStatsByEvent.get(focusEvent.id)) : null

  if (noEvents) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl py-6 text-center">
          <h1 className="text-3xl font-bold text-ink">{firstName ? `Bienvenue ${firstName} !` : 'Bienvenue !'}</h1>
          <p className="mt-3 text-muted">Votre événement en ligne en trois étapes, depuis votre téléphone.</p>
          <ol className="mx-auto mt-8 grid max-w-xl gap-3 text-left">
            {[
              ['Créez votre page', 'Type d’événement, date, lieu, modèle : 5 minutes.'],
              ['Ajoutez vos invités', 'Un par un ou en important votre liste Excel.'],
              ['Envoyez les invitations sur WhatsApp', 'Chacun répond en un clic et reçoit son pass.'],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-border-soft bg-surface p-4">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-brand-gradient text-sm font-bold text-white">{i + 1}</span>
                <span>
                  <b className="block text-ink">{title}</b>
                  <span className="text-sm text-muted">{text}</span>
                </span>
              </li>
            ))}
          </ol>
          <Button as={Link} to={CREATE_EVENT_PATH} variant="gradient" className="mt-8 px-8 py-3.5 text-base">
            Créer mon événement
          </Button>
        </div>
      </DashboardLayout>
    )
  }

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

      {!loading && step && (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-brand-purple/30 bg-brand-purple/10 p-5">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-brand-gradient text-white">
            <step.icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wider text-brand-purple uppercase">Prochaine étape</p>
            <p className="mt-0.5 font-semibold text-ink">{step.title}</p>
            <p className="text-sm text-muted">{step.text}</p>
          </div>
          <Button as={Link} to={step.to} variant="gradient">
            {step.cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
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
