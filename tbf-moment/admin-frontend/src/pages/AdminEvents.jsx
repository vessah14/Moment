import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/layout/AdminLayout'
import StatusBadge from '../components/ui/StatusBadge'
import TablePagination from '../components/ui/TablePagination'
import { listPlatformEvents, updateEventSuspension } from '../api/platform'
import usePagination from '../utils/usePagination'

export default function AdminEvents () {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('Tous')
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => {
    listPlatformEvents()
      .then(data => {
        setEvents(data ?? [])
        setError('')
      })
      .catch(err =>
        setError(err.message || 'Impossible de charger les événements.')
      )
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(
    () => ['Tous', ...new Set(events.map(e => e.category))],
    [events]
  )

  const filtered = events.filter(
    e => category === 'Tous' || e.category === category
  )
  const pagination = usePagination(filtered)

  const toggleSuspend = async event => {
    setUpdatingId(event.id)
    setError('')
    try {
      const updated = await updateEventSuspension(
        event.id,
        event.status !== 'Suspendu'
      )
      setEvents(prev => prev.map(e => (e.id === event.id ? updated : e)))
    } catch (err) {
      setError(err.message || 'La mise à jour a échoué.')
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <AdminLayout>
      <div>
        <h1 className='text-2xl font-bold text-ink'>Événements</h1>
        <p className='mt-1.5 text-sm text-muted'>
          {events.length} événements créés sur la plateforme
        </p>
      </div>

      {error && (
        <p className='mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger'>
          {error}
        </p>
      )}

      <div className='mt-6 flex flex-wrap gap-3'>
        {categories.map(cat => (
          <button
            key={cat}
            type='button'
            onClick={() => {
              setCategory(cat)
              pagination.resetPage()
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              category === cat
                ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                : 'border border-border text-muted hover:border-faint hover:text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className='mt-6 overflow-hidden rounded-2xl border border-border-soft bg-surface'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[720px] text-left text-sm'>
            <thead>
              <tr className='border-b border-border-soft text-xs tracking-wider text-faint uppercase'>
                <th className='px-6 py-3 font-medium'>Événement</th>
                <th className='px-3 py-3 font-medium'>Organisation</th>
                <th className='px-3 py-3 font-medium'>Catégorie</th>
                <th className='px-3 py-3 font-medium'>Invités</th>
                <th className='px-3 py-3 font-medium'>Statut</th>
                <th className='w-32 px-3 py-3' />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-10 text-center text-sm text-faint'
                  >
                    Chargement…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-10 text-center text-sm text-faint'
                  >
                    Aucun événement dans cette catégorie.
                  </td>
                </tr>
              )}
              {!loading &&
                pagination.pageItems.map(event => (
                  <tr
                    key={event.id}
                    className='border-b border-border-soft last:border-b-0'
                  >
                    <td className='px-6 py-4'>
                      <p className='font-medium text-ink'>{event.name}</p>
                      <p className='text-xs text-faint'>
                        {event.eventDate
                          ? new Date(event.eventDate).toLocaleDateString(
                              'fr-FR'
                            )
                          : 'Date à définir'}
                      </p>
                    </td>
                    <td className='px-3 py-4 text-muted'>
                      {event.organization}
                    </td>
                    <td className='px-3 py-4 text-muted'>{event.category}</td>
                    <td className='px-3 py-4 font-mono text-muted'>
                      {event.guests}
                    </td>
                    <td className='px-3 py-4'>
                      <StatusBadge status={event.status} />
                    </td>
                    <td className='px-3 py-4'>
                      {event.status !== 'Brouillon' && (
                        <button
                          type='button'
                          disabled={updatingId === event.id}
                          onClick={() => toggleSuspend(event)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                            event.status === 'Suspendu'
                              ? 'border-success/40 text-success hover:bg-success/10'
                              : 'border-danger/40 text-danger hover:bg-danger/10'
                          }`}
                        >
                          {event.status === 'Suspendu'
                            ? 'Rétablir'
                            : 'Suspendre'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          pageSize={pagination.pageSize}
          rangeEnd={pagination.rangeEnd}
          rangeStart={pagination.rangeStart}
          totalItems={filtered.length}
          onPageChange={pagination.setPage}
        />
      </div>
    </AdminLayout>
  )
}
