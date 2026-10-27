import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout'
import StatCard from '../components/dashboard/StatCard'
import ActivityCharts from '../components/charts/ActivityCharts'
import StatusBadge from '../components/ui/StatusBadge'
import {
  getDashboardSummary,
  listModerationQueue,
  listOrganizations,
} from '../api/platform'

const dateLabel = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })
    .format(new Date(year, month - 1, day))
}

export default function AdminOverview() {
  const [dashboard, setDashboard] = useState(null)
  const [organizations, setOrganizations] = useState([])
  const [moderationQueue, setModerationQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getDashboardSummary(), listOrganizations(), listModerationQueue()])
      .then(([summary, orgs, queue]) => {
        setDashboard(summary)
        setOrganizations(orgs ?? [])
        setModerationQueue(queue ?? [])
        setError('')
      })
      .catch((err) => setError(err.message || "Impossible de charger la vue d'ensemble."))
      .finally(() => setLoading(false))
  }, [])

  const stats = dashboard
    ? [
        {
          label: 'Organisations actives',
          value: String(dashboard.activeOrganizations),
          hint: `+${dashboard.trends.organizations} cette semaine`,
        },
        {
          label: 'Événements',
          value: String(dashboard.totalEvents),
          hint: `+${dashboard.trends.events} cette semaine`,
        },
        {
          label: 'Invités cumulés',
          value: String(dashboard.totalGuests),
          hint: `+${dashboard.trends.guests} cette semaine`,
        },
        {
          label: 'Alertes à traiter',
          value: String(dashboard.moderationAlerts + dashboard.failedPayments),
          hint: `${dashboard.moderationAlerts} modération · ${dashboard.kPayEnabled ? `${dashboard.failedPayments} paiement(s) échoué(s)` : 'KPay désactivé'}`,
        },
      ]
    : []

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-ink">Vue globale</h1>
        <p className="mt-1.5 text-sm text-muted">
          Indicateurs réels de la plateforme et évolution sur les 7 derniers jours.
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {dashboard && (
        <section
          aria-label="Alertes de la plateforme"
          className={`mt-5 rounded-xl border px-4 py-3 ${
            dashboard.moderationAlerts + dashboard.failedPayments > 0
              ? 'border-danger/30 bg-danger/10'
              : 'border-success/30 bg-success/10'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">
              {dashboard.moderationAlerts + dashboard.failedPayments > 0
                ? 'Alertes à traiter'
                : 'Aucune alerte à traiter'}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {dashboard.moderationAlerts > 0 && (
                <Link to="/admin/moderation" className="text-danger hover:underline">
                  {dashboard.moderationAlerts} signalement(s)
                </Link>
              )}
              {dashboard.kPayEnabled && dashboard.failedPayments > 0 && (
                <Link to="/admin/facturation" className="text-danger hover:underline">
                  {dashboard.failedPayments} paiement(s) échoué(s)
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading
          ? ['Organisations actives', 'Événements', 'Invités cumulés', 'Alertes à traiter'].map((label) => (
              <StatCard key={label} label={label} value="…" />
            ))
          : stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <ActivityCharts kPayEnabled={dashboard?.kPayEnabled} />

      {dashboard && (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border-soft bg-surface p-5">
              <h2 className="font-semibold text-ink">Parcours des organisations</h2>
              <p className="mt-1 text-xs text-faint">Étapes cumulées depuis l’inscription.</p>
              <div className="mt-5 space-y-4">
                {dashboard.funnel.map((step, index) => {
                  const total = dashboard.funnel[0]?.organizations ?? 0
                  const percent = total ? Math.round((step.organizations / total) * 100) : 0
                  return (
                    <div key={step.label}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="text-muted">{index + 1}. {step.label}</span>
                        <span className="font-mono text-ink">{step.organizations} <span className="text-faint">({percent} %)</span></span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full rounded-full bg-brand-purple" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-border-soft bg-surface p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-ink">Événements des 7 prochains jours</h2>
                  <p className="mt-1 text-xs text-faint">Événements datés à venir.</p>
                </div>
                <Link to="/admin/evenements" className="text-sm text-brand-purple hover:underline">
                  Tout voir
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {dashboard.upcomingEvents.length === 0 && (
                  <p className="text-sm text-faint">Aucun événement prévu cette semaine.</p>
                )}
                {dashboard.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between gap-3 rounded-lg border border-border-soft px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{event.name}</p>
                      <p className="mt-1 truncate text-xs text-faint">{event.organization} · {event.guests} invité(s)</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{dateLabel(event.eventDate)}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-border-soft bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink">Activité des 7 derniers jours</h2>
              <Link to="/admin/activite" className="text-sm text-brand-purple hover:underline">
                Journal d’activité
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ['Inscriptions', dashboard.trends.organizations],
                ['Événements créés', dashboard.trends.events],
                ['Événements publiés', dashboard.trends.publishedEvents],
                ['Invités ajoutés', dashboard.trends.guests],
                ['Réponses RSVP', dashboard.trends.rsvps],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border-soft px-3 py-3">
                  <p className="text-xs text-faint">{label}</p>
                  <p className="mt-1 font-mono text-xl font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-border-soft bg-surface">
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="font-semibold text-ink">Dernières organisations</h2>
            <Link to="/admin/organisations" className="text-sm text-brand-purple hover:underline">
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
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-faint">Aucune organisation.</td></tr>
                )}
                {organizations.slice(0, 5).map((org) => (
                  <tr key={org.id} className="border-b border-border-soft last:border-b-0">
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink">{org.name}</p>
                      <p className="text-xs text-faint">{org.email}</p>
                    </td>
                    <td className="px-3 py-4 text-muted">{org.plan}</td>
                    <td className="px-3 py-4 font-mono text-muted">{org.events}</td>
                    <td className="px-3 py-4"><StatusBadge status={org.isActive ? 'Actif' : 'Suspendu'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <section className="rounded-2xl border border-danger/30 bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Alertes de modération</h2>
            <Link to="/admin/moderation" className="text-sm text-brand-purple hover:underline">Tout voir</Link>
          </div>
          <p className="mt-2 text-sm text-muted">{moderationQueue.length} élément(s) en attente.</p>
          <div className="mt-4 space-y-3">
            {moderationQueue.length === 0 && (
              <p className="text-sm text-faint">Aucun signalement en attente.</p>
            )}
            {moderationQueue.slice(0, 4).map((item) => (
              <div key={`${item.type}-${item.id}`} className="rounded-lg border border-border-soft px-4 py-3">
                <p className="text-xs font-semibold text-danger uppercase">{item.type}</p>
                <p className="mt-1 text-sm text-ink">{item.content}</p>
                <p className="mt-1 text-xs text-faint">{item.organization}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
