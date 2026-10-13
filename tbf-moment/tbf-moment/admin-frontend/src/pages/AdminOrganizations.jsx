import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/layout/AdminLayout'
import StatusBadge from '../components/ui/StatusBadge'
import TablePagination from '../components/ui/TablePagination'
import { listOrganizations, updateOrganizationStatus } from '../api/platform'
import usePagination from '../utils/usePagination'

export default function AdminOrganizations () {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => {
    listOrganizations()
      .then(data => {
        setOrganizations(data ?? [])
        setError('')
      })
      .catch(err =>
        setError(err.message || 'Impossible de charger les organisations.')
      )
      .finally(() => setLoading(false))
  }, [])
  const filtered = useMemo(
    () =>
      organizations.filter(
        org =>
          org.name.toLowerCase().includes(query.toLowerCase()) ||
          org.email.toLowerCase().includes(query.toLowerCase())
      ),
    [organizations, query]
  )
  const pagination = usePagination(filtered)

  const toggleStatus = async org => {
    setUpdatingId(org.id)
    setError('')
    try {
      const updated = await updateOrganizationStatus(org.id, !org.isActive)
      setOrganizations(prev => prev.map(o => (o.id === org.id ? updated : o)))
    } catch (err) {
      setError(err.message || 'La mise à jour a échoué.')
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <AdminLayout>
      <div>
        <h1 className='text-2xl font-bold text-ink'>Organisations</h1>
        <p className='mt-1.5 text-sm text-muted'>
          {organizations.length} comptes sur la plateforme
        </p>
      </div>

      {error && (
        <p className='mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger'>
          {error}
        </p>
      )}

      <div className='relative mt-6 max-w-sm'>
        <Search className='pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint' />
        <input
          type='search'
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            pagination.resetPage()
          }}
          placeholder='Rechercher une organisation'
          className='w-full rounded-lg border border-border bg-surface py-2.5 pr-4 pl-10 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple'
        />
      </div>

      <div className='mt-6 overflow-hidden rounded-2xl border border-border-soft bg-surface'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[720px] text-left text-sm'>
            <thead>
              <tr className='border-b border-border-soft text-xs tracking-wider text-faint uppercase'>
                <th className='px-6 py-3 font-medium'>Organisation</th>
                <th className='px-3 py-3 font-medium'>Plan</th>
                <th className='px-3 py-3 font-medium'>Événements</th>
                <th className='px-3 py-3 font-medium'>Inscrit le</th>
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
                    Aucune organisation ne correspond à cette recherche.
                  </td>
                </tr>
              )}
              {!loading &&
                pagination.pageItems.map(org => (
                  <tr
                    key={org.id}
                    className='border-b border-border-soft last:border-b-0'
                  >
                    <td className='px-6 py-4'>
                      <p className='font-medium text-ink'>{org.name}</p>
                      <p className='text-xs text-faint'>{org.email}</p>
                    </td>
                    <td className='px-3 py-4 text-muted'>{org.plan}</td>
                    <td className='px-3 py-4 font-mono text-muted'>
                      {org.events}
                    </td>
                    <td className='px-3 py-4 text-muted'>
                      {new Date(org.joinedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className='px-3 py-4'>
                      <StatusBadge
                        status={org.isActive ? 'Actif' : 'Suspendu'}
                      />
                    </td>
                    <td className='px-3 py-4'>
                      <button
                        type='button'
                        disabled={updatingId === org.id}
                        onClick={() => toggleStatus(org)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                          org.isActive
                            ? 'border-danger/40 text-danger hover:bg-danger/10'
                            : 'border-success/40 text-success hover:bg-success/10'
                        }`}
                      >
                        {org.isActive ? 'Suspendre' : 'Réactiver'}
                      </button>
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
