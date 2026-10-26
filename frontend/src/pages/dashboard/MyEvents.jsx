import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listEvents,
  updateEvent,
  createEvent,
  deleteEvent
} from '../../api/events'
import { eventShareUrl } from '../../api/client'
import { trackPublicEvent } from '../../api/publicEvents'
import { listEventCategories } from '../../api/eventCategories'
import { useToast } from '../../utils/useToast'
import EventCard from '../../components/events/EventCard'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/Dialog'
import { formatEventDate, statusLabel } from '../../utils/eventStatus'

const FILTERS = ['Tous', 'Publiés', 'Brouillons', 'Passés']

export default function MyEvents () {
  const toast = useToast()
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('Tous')
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingEvent, setDeletingEvent] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([listEvents(), listEventCategories()])
      .then(([eventsData, categoriesData]) => {
        if (cancelled) return
        setEvents(eventsData ?? [])
        setCategories(categoriesData ?? [])
        setError('')
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message || 'Impossible de charger vos événements.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const categoryLabel = useMemo(() => {
    const map = new Map(categories.map(c => [c.id, c.label]))
    return categoryId => map.get(categoryId) ?? '—'
  }, [categories])

  const activeEvents = events.filter(e => e.status !== 'Archive')
  const archivedEvents = events.filter(e => e.status === 'Archive')

  const filtered = useMemo(() => {
    return activeEvents.filter(event => {
      const matchesFilter =
        filter === 'Tous' ||
        (filter === 'Publiés' && event.status === 'Publie') ||
        (filter === 'Brouillons' && event.status === 'Brouillon') ||
        (filter === 'Passés' &&
          event.eventDate &&
          new Date(event.eventDate) < new Date())
      const matchesQuery = event.name
        .toLowerCase()
        .includes(query.toLowerCase())
      return matchesFilter && matchesQuery
    })
  }, [activeEvents, filter, query])

  const runAction = async action => {
    setError('')
    try {
      await action()
      const fresh = await listEvents()
      setEvents(fresh ?? [])
      return true
    } catch (err) {
      setError(err.message || "L'action a échoué.")
      return false
    }
  }

  const toUpdateDto = (event, patch) => ({
    name: event.name,
    categoryId: event.categoryId,
    status: event.status,
    eventDate: event.eventDate,
    startTime: event.startTime,
    coverImageUrl: event.coverImageUrl,
    themeColor: event.themeColor,
    themeFont: event.themeFont,
    customFields: event.customFields,
    ...patch
  })

  const handlePublish = event =>
    runAction(() =>
      updateEvent(event.id, toUpdateDto(event, { status: 'Publie' }))
    )

  const handleUnpublish = event => {
    const confirmed = window.confirm(
      `Dépublier le site de « ${event.name} » ? Il ne sera plus accessible au public, mais vous pourrez le republier plus tard.`
    )
    if (!confirmed) return

    return runAction(() =>
      updateEvent(event.id, toUpdateDto(event, { status: 'Brouillon' }))
    )
  }

  const handleDelete = event => setDeletingEvent(event)

  const confirmDelete = async () => {
    if (!deletingEvent || deleteBusy) return
    setDeleteBusy(true)
    const deleted = await runAction(() => deleteEvent(deletingEvent.id))
    if (deleted) setDeletingEvent(null)
    setDeleteBusy(false)
  }

  const handleArchive = event =>
    runAction(() =>
      updateEvent(event.id, toUpdateDto(event, { status: 'Archive' }))
    )

  const handleRestore = event =>
    runAction(() =>
      updateEvent(event.id, toUpdateDto(event, { status: 'Brouillon' }))
    )

  const handleDuplicate = event =>
    runAction(() =>
      createEvent({
        name: `${event.name} (copie)`,
        categoryId: event.categoryId,
        eventDate: event.eventDate,
        startTime: event.startTime,
        coverImageUrl: event.coverImageUrl,
        themeColor: event.themeColor,
        themeFont: event.themeFont,
        customFields: event.customFields
      })
    )

  const toCardProps = event => ({
    name: event.name,
    status: event.isSuspended ? 'Suspendu' : statusLabel(event.status),
    category: categoryLabel(event.categoryId),
    date: formatEventDate(event.eventDate),
    location: '—',
    progressLabel: 'RSVP',
    confirmed: 0,
    total: 0,
    barColor: 'bg-success'
  })

  return (
    <DashboardLayout>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-ink'>Mes événements</h1>
          <p className='mt-1.5 text-muted'>
            {activeEvents.filter(e => e.status === 'Publie').length} actifs ·{' '}
            {activeEvents.filter(e => e.status === 'Brouillon').length}{' '}
            brouillon(s)
          </p>
        </div>
        <div className='flex gap-3'>
          <Button variant='outline' onClick={() => setShowArchived(v => !v)}>
            {showArchived
              ? 'Voir les actifs'
              : `Archives (${archivedEvents.length})`}
          </Button>
          <Button
            as={Link}
            to='/dashboard/evenements/nouveau'
            variant='gradient'
          >
            Nouvel événement
          </Button>
        </div>
      </div>

      {error && (
        <p className='mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger'>
          {error}
        </p>
      )}

      {!showArchived && (
        <div className='mt-8 flex flex-wrap items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='relative'>
              <Search className='pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint' />
              <input
                type='search'
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Rechercher'
                className='w-48 rounded-lg border border-border bg-surface py-2.5 pr-4 pl-10 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple'
              />
            </div>
            {FILTERS.map(f => (
              <button
                key={f}
                type='button'
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === f
                    ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                    : 'border border-border text-muted hover:border-faint hover:text-ink'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <p className='mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint'>
          Chargement de vos événements…
        </p>
      )}

      {!loading &&
        showArchived &&
        (archivedEvents.length === 0 ? (
          <p className='mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint'>
            Aucun événement archivé.
          </p>
        ) : (
          <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {archivedEvents.map(event => (
              <EventCard
                key={event.id}
                {...toCardProps(event)}
                actions={[
                  {
                    label: 'Restaurer',
                    highlight: true,
                    onClick: () => handleRestore(event)
                  },
                  {
                    label: 'Supprimer',
                    danger: true,
                    onClick: () => handleDelete(event)
                  }
                ]}
              />
            ))}
          </div>
        ))}

      {!loading && !showArchived && (
        <>
          {filtered.length === 0 && (
            <p className='mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint'>
              Aucun événement dans « {filter} ».
            </p>
          )}

          <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {filtered.map(event => (
              <EventCard
                key={event.id}
                {...toCardProps(event)}
                actions={
                  event.status === 'Brouillon'
                    ? [
                        {
                          label: 'Ajouter des invités',
                          to: `/dashboard/participants?eventId=${encodeURIComponent(event.id)}&add=1`
                        },
                        {
                          label: 'Modifier',
                          to: `/dashboard/evenements/${event.id}/modifier`
                        },
                        {
                          label: 'Dupliquer',
                          onClick: () => handleDuplicate(event)
                        },
                        {
                          label: 'Publier',
                          highlight: true,
                          onClick: () => handlePublish(event)
                        },
                        {
                          label: 'Supprimer',
                          danger: true,
                          onClick: () => handleDelete(event)
                        }
                      ]
                    : [
                        {
                          label: 'Ajouter des invités',
                          to: `/dashboard/participants?eventId=${encodeURIComponent(event.id)}&add=1`
                        },
                        {
                          label: 'Modifier',
                          to: `/dashboard/evenements/${event.id}/modifier`
                        },
                        ...(event.slug
                          ? [
                              {
                                label: 'Voir le site',
                                to: `/e/${encodeURIComponent(event.slug)}`,
                                external: true,
                                highlight: true
                              },
                              {
                                // Lien avec le vrai aperçu (titre, couverture) sur WhatsApp, Facebook…
                                label: 'Copier le lien de partage',
                                onClick: async () => {
                                  try {
                                    await navigator.clipboard.writeText(eventShareUrl(event.slug))
                                    trackPublicEvent(event.slug, 'share')
                                    toast('Lien de partage copié')
                                  } catch {
                                    toast('Copie impossible : ' + eventShareUrl(event.slug), { variant: 'error', duration: 10000 })
                                  }
                                }
                              }
                            ]
                          : []),
                        {
                          label: 'Archiver',
                          danger: true,
                          onClick: () => handleArchive(event)
                        },
                        {
                          label: 'Dépublier',
                          danger: true,
                          onClick: () => handleUnpublish(event)
                        },
                        {
                          label: 'Personnaliser',
                          to: `/builder/${event.id}`
                        },
                        {
                          label: 'Supprimer',
                          danger: true,
                          onClick: () => handleDelete(event)
                        }
                      ]
                }
              />
            ))}

            <Link
              to='/dashboard/evenements/nouveau'
              className='flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-10 text-center transition hover:border-faint'
            >
              <span className='h-10 w-10 rounded-xl bg-surface-2' />
              <span className='font-semibold text-ink'>Créer un événement</span>
            </Link>
          </div>
        </>
      )}
      <ConfirmDialog
        open={Boolean(deletingEvent)}
        title="Supprimer cet événement ?"
        message={`L’événement « ${deletingEvent?.name ?? ''} », son site et ses données associées seront supprimés définitivement. Cette action est irréversible.`}
        confirmLabel="Supprimer définitivement"
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => !deleteBusy && setDeletingEvent(null)}
      />
    </DashboardLayout>
  )
}
