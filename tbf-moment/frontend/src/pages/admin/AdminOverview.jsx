import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import StatCard from '../../components/dashboard/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'
import { MODERATION_QUEUE, ORGANIZATIONS, PLATFORM_EVENTS } from '../../data/adminData'

const STATS = [
  { label: 'Organisations actives', value: '4', hint: '+1 ce mois-ci', hintColor: 'success' },
  { label: 'Événements créés', value: '4', hint: '3 publiés · 1 brouillon' },
  { label: 'MRR', value: '84 700', hint: 'FCFA · +12%', hintColor: 'success' },
  { label: 'Invités cumulés', value: '1 200', hint: 'tous événements confondus' },
]

export default function AdminOverview() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-ink">Vue globale</h1>
        <p className="mt-1.5 text-sm text-muted">
          État de la plateforme TBF Moment, tous comptes confondus.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
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
                {ORGANIZATIONS.map((org) => (
                  <tr key={org.id} className="border-b border-border-soft last:border-b-0">
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink">{org.name}</p>
                      <p className="text-xs text-faint">{org.email}</p>
                    </td>
                    <td className="px-3 py-4 text-muted">{org.plan}</td>
                    <td className="px-3 py-4 font-mono text-muted">{org.events}</td>
                    <td className="px-3 py-4">
                      <StatusBadge status={org.status} />
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
            {MODERATION_QUEUE.map((item) => (
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
          {PLATFORM_EVENTS.map((event) => (
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
