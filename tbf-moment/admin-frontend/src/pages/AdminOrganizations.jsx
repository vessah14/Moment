import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import AdminLayout from '../components/layout/AdminLayout'
import StatusBadge from '../components/ui/StatusBadge'
import { ORGANIZATIONS } from '../data/adminData'

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState(ORGANIZATIONS)
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () =>
      organizations.filter((org) =>
        org.name.toLowerCase().includes(query.toLowerCase()) ||
        org.email.toLowerCase().includes(query.toLowerCase()),
      ),
    [organizations, query],
  )

  const toggleStatus = (id) => {
    setOrganizations((prev) =>
      prev.map((org) =>
        org.id === id
          ? { ...org, status: org.status === 'Actif' ? 'Suspendu' : 'Actif' }
          : org,
      ),
    )
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-ink">Organisations</h1>
        <p className="mt-1.5 text-sm text-muted">
          {organizations.length} comptes sur la plateforme
        </p>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une organisation"
          className="w-full rounded-lg border border-border bg-surface py-2.5 pr-4 pl-10 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border-soft bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-soft text-xs tracking-wider text-faint uppercase">
                <th className="px-6 py-3 font-medium">Organisation</th>
                <th className="px-3 py-3 font-medium">Plan</th>
                <th className="px-3 py-3 font-medium">Événements</th>
                <th className="px-3 py-3 font-medium">Inscrit le</th>
                <th className="px-3 py-3 font-medium">Statut</th>
                <th className="w-32 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr key={org.id} className="border-b border-border-soft last:border-b-0">
                  <td className="px-6 py-4">
                    <p className="font-medium text-ink">{org.name}</p>
                    <p className="text-xs text-faint">{org.email}</p>
                  </td>
                  <td className="px-3 py-4 text-muted">{org.plan}</td>
                  <td className="px-3 py-4 font-mono text-muted">{org.events}</td>
                  <td className="px-3 py-4 text-muted">{org.joined}</td>
                  <td className="px-3 py-4">
                    <StatusBadge status={org.status} />
                  </td>
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      onClick={() => toggleStatus(org.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        org.status === 'Actif'
                          ? 'border-danger/40 text-danger hover:bg-danger/10'
                          : 'border-success/40 text-success hover:bg-success/10'
                      }`}
                    >
                      {org.status === 'Actif' ? 'Suspendre' : 'Réactiver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
