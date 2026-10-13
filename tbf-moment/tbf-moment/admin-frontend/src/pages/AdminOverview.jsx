import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout'
import StatCard from '../components/dashboard/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import { listModerationQueue, listOrganizations, listPlatformEvents, listTransactions } from '../api/platform'
import { formatCents } from '../utils/formatCurrency'

export default function AdminOverview() {
  const [organizations, setOrganizations] = useState([])
  const [events, setEvents] = useState([])
  const [moderationQueue, setModerationQueue] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listOrganizations(), listPlatformEvents(), listModerationQueue(), listTransactions()])
      .then(([orgs, evts, queue, txs]) => {
        setOrganizations(orgs ?? [])
        setEvents(evts ?? [])
        setModerationQueue(queue ?? [])
        setTransactions(txs ?? [])
        setError('')
      })
      .catch((err) => setError(err.message || "Impossible de charger la vue d'ensemble."))
      .finally(() => setLoading(false))
  }, [])

  const publishedCount = events.filter((e) => e.status === 'Publié').length
  const draftCount = events.filter((e) => e.status === 'Brouillon').length
  const mrr = transactions.reduce((sum, t) => sum + t.amountCents, 0)
  const totalGuests = events.reduce((sum, e) => sum + e.guests, 0)

  const stats = [
    {
      label: 'Organisations actives',
      value: String(organizations.filter((o) => o.isActive).length),
    },
    {
      label: 'Événements créés',
      value: String(events.length),
      hint: `${publishedCount} publiés · ${draftCount} brouillon(s)`,
    },
    { label: 'MRR', value: formatCents(mrr) },
    { label: 'Invités cumulés', value: String(totalGuests), hint: 'tous événements confondus' },
  ]

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-ink">Vue globale</h1>
        <p className="mt-1.5 text-sm text-muted">
          État de la plateforme TBF Moment, tous comptes confondus.
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading
          ? stats.map((s) => <StatCard key={s.label} label={s.label} value="…" />)
          : stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-border-soft bg-surface">
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="font-semibold text-ink">Dernières organisations</h2>
            <Link
              to="/admin/organisations"
              className="text-sm text-brand-purple hover:underline"
            >
              Tout voir
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-y border-border-soft text-xs tracking-wider text-faint uppercase">
                  <th className="px-6 py-3 font-medium">Organisation</th>
                  <th className="px-3 py-3 font-medium">Plan</th>
                  <th className="px-3 py-3 font-medium">Événements</th>
                  <th className="px-3 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {!loading && organizations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-faint">
                      Aucune organisation.
                    </td>
                  </tr>
                )}
                {organizations.slice(0, 5).map((org) => (
                  <tr key={org.id} className="border-b border-border-soft last:border-b-0">
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink">{org.name}</p>
                      <p className="text-xs text-faint">{org.email}</p>
                    </td>
                    <td className="px-3 py-4 text-muted">{org.plan}</td>
                    <td className="px-3 py-4 font-mono text-muted">{org.events}</td>
                    <td className="px-3 py-4">
                      <StatusBadge status={org.isActive ? 'Actif' : 'Suspendu'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-danger/30 bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Alertes modération</h2>
            <Link
              to="/admin/moderation"
              className="text-sm text-brand-purple hover:underline"
            >
              Tout voir
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {!loading && moderationQueue.length === 0 && (
              <p className="text-sm text-faint">Rien à signaler.</p>
            )}
            {moderationQueue.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border-soft px-4 py-3"
              >
                <p className="text-xs font-semibold text-danger uppercase">
                  {item.type}
                </p>
                <p className="mt-1 text-sm text-ink">{item.content}</p>
                <p className="mt-1 text-xs text-faint">{item.organization}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border-soft bg-surface p-5">
        <h2 className="font-semibold text-ink">Derniers événements créés</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {!loading && events.length === 0 && (
            <p className="text-sm text-faint">Aucun événement.</p>
          )}
          {events.slice(0, 4).map((event) => (
            <div
              key={event.id}
              className="rounded-lg border border-border-soft px-4 py-3"
            >
              <p className="font-medium text-ink">{event.name}</p>
              <p className="mt-1 text-xs text-faint">{event.organization}</p>
              <div className="mt-2">
                <StatusBadge status={event.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
