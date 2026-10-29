import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout'
import StatusBadge from '../components/ui/StatusBadge'
import {
  getOrganization,
  grantOrganizationPlan,
  revokeOrganizationPlan,
  updateEventSuspension,
  updateOrganizationStatus,
} from '../api/platform'

const SITE = (import.meta.env.VITE_CLIENT_APP_URL || 'http://localhost:5173').replace(/\/+$/, '')
const date = (value) => (value ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')
const EVENT_STATUS = { Publie: 'Publié', Brouillon: 'Brouillon', Archive: 'Archivé' }
const GRANT_DAYS = [
  { days: 30, label: '30 jours' },
  { days: 90, label: '3 mois' },
  { days: 365, label: '1 an' },
]

// Fiche d'une organisation : son compte, son offre, ses événements et ses paiements, et
// les gestes du support (offre offerte, retour à Free, suspension). Chaque action est
// tracée dans le journal d'activité.
export default function AdminOrganizationDetail() {
  const { id } = useParams()
  const [org, setOrg] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [planId, setPlanId] = useState('')
  const [days, setDays] = useState(30)

  useEffect(() => {
    let cancelled = false
    getOrganization(id)
      .then((data) => {
        if (cancelled) return
        setOrg(data)
        setPlanId((current) => current || data.availablePlans?.[0]?.id || '')
      })
      .catch((err) => !cancelled && setError(err.message || 'Organisation introuvable.'))
    return () => {
      cancelled = true
    }
  }, [id])

  const run = async (key, action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return
    setBusy(key)
    setError('')
    try {
      const result = await action()
      if (result?.id) setOrg(result)
    } catch (err) {
      setError(err.message || 'Action impossible.')
    } finally {
      setBusy('')
    }
  }

  const reload = () => getOrganization(id).then(setOrg)
  const planName = org?.availablePlans.find((p) => p.id === planId)?.label ?? ''

  return (
    <AdminLayout>
      <Link to="/admin/organisations" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Organisations
      </Link>

      {error && <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</p>}

      {!org ? (
        !error && <p className="mt-8 text-sm text-faint">Chargement…</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{org.name}</h1>
              <p className="mt-1 text-sm text-muted">
                {org.email}
                {org.phone ? ` · ${org.phone}` : ''} · inscrit le {date(org.joinedAt)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge status={org.isActive ? 'Actif' : 'Suspendu'} />
                <StatusBadge status={org.emailVerified ? 'E-mail confirmé' : 'E-mail non confirmé'} />
              </div>
            </div>
            <button
              type="button"
              disabled={busy === 'status'}
              onClick={() =>
                run(
                  'status',
                  () => updateOrganizationStatus(org.id, !org.isActive).then(reload),
                  org.isActive ? `Suspendre le compte de ${org.name} ? Il ne pourra plus se connecter.` : null,
                )
              }
              className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50 ${org.isActive ? 'border border-danger/40 text-danger hover:bg-danger/10' : 'bg-success/15 text-success'}`}
            >
              {org.isActive ? 'Suspendre le compte' : 'Réactiver le compte'}
            </button>
          </div>

          {/* Offre : en cours, offrir ou attribuer une offre, retour à Free. */}
          <section className="mt-6 rounded-2xl border border-border-soft bg-surface p-5">
            <h2 className="font-semibold text-ink">Offre</h2>
            <p className="mt-1 text-sm text-muted">
              <b className="text-ink">{org.planLabel}</b>
              {org.planEndsAt ? ` jusqu’au ${date(org.planEndsAt)}` : org.planCode === 'free' ? ' (gratuite)' : ''}
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="text-xs text-muted">
                Offre
                <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="mt-1 block rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink">
                  {org.availablePlans.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-muted">
                Durée
                <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="mt-1 block rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink">
                  {GRANT_DAYS.map((d) => (
                    <option key={d.days} value={d.days}>{d.label}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={!planId || busy === 'grant'}
                onClick={() =>
                  run('grant', () => grantOrganizationPlan(org.id, planId, days), `Attribuer ${planName} pendant ${days} jours à ${org.name} ? L’offre en cours s’arrête aussitôt.`)
                }
                className="rounded-xl bg-brand-purple px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy === 'grant' ? '…' : 'Attribuer l’offre'}
              </button>
              {org.planCode !== 'free' && (
                <button
                  type="button"
                  disabled={busy === 'revoke'}
                  onClick={() => run('revoke', () => revokeOrganizationPlan(org.id), `Repasser ${org.name} sur l’offre Free tout de suite ?`)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted hover:text-ink disabled:opacity-50"
                >
                  Repasser en Free
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-faint">Pour un mois offert, ou un paiement reçu hors SasPay (espèces, virement).</p>
          </section>

          {/* Événements de l'organisation, avec suspension directe. */}
          <section className="mt-6 rounded-2xl border border-border-soft bg-surface">
            <h2 className="px-5 pt-5 font-semibold text-ink">Événements ({org.events.length})</h2>
            {org.events.length === 0 ? (
              <p className="px-5 py-6 text-sm text-faint">Aucun événement créé.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-border-soft text-xs tracking-wider text-faint uppercase">
                    <tr>
                      <th className="px-5 py-2 font-medium">Événement</th>
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 text-right font-medium">Invités</th>
                      <th className="px-3 py-2 text-right font-medium">Confirmés</th>
                      <th className="px-3 py-2 text-right font-medium">Visites</th>
                      <th className="px-3 py-2 font-medium">Statut</th>
                      <th className="px-5 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {org.events.map((e) => (
                      <tr key={e.id} className="border-b border-border-soft last:border-b-0">
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink">{e.name}</p>
                          {e.status === 'Publie' && (
                            <a href={`${SITE}/e/${encodeURIComponent(e.slug)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-purple hover:underline">
                              Voir la page <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </a>
                          )}
                        </td>
                        <td className="px-3 py-3 text-muted">{e.eventDate ? date(e.eventDate) : '—'}</td>
                        <td className="px-3 py-3 text-right font-mono text-muted">{e.guests}</td>
                        <td className="px-3 py-3 text-right font-mono text-muted">{e.confirmed}</td>
                        <td className="px-3 py-3 text-right font-mono text-muted">{e.visits}</td>
                        <td className="px-3 py-3">
                          <StatusBadge status={e.suspended ? 'Suspendu' : EVENT_STATUS[e.status] ?? e.status} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            disabled={busy === e.id}
                            onClick={() =>
                              run(e.id, () => updateEventSuspension(e.id, !e.suspended).then(reload), e.suspended ? null : `Suspendre « ${e.name} » ? La page ne sera plus visible.`)
                            }
                            className={`text-xs font-semibold disabled:opacity-50 ${e.suspended ? 'text-success' : 'text-danger'}`}
                          >
                            {e.suspended ? 'Rétablir' : 'Suspendre'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border-soft bg-surface p-5">
              <h2 className="font-semibold text-ink">Paiements</h2>
              {org.payments.length === 0 ? (
                <p className="mt-3 text-sm text-faint">Aucun paiement.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {org.payments.map((p, i) => (
                    <li key={i} className="flex flex-wrap justify-between gap-2 border-b border-border-soft pb-2 last:border-b-0">
                      <span className="text-muted">{p.planLabel || 'Offre'} · {date(p.createdAt)}</span>
                      <span className="font-mono text-ink">{p.amount.toLocaleString('fr-FR')} F · {p.paidAt ? 'payé' : p.status.toLowerCase()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-2xl border border-border-soft bg-surface p-5">
              <h2 className="font-semibold text-ink">Historique des offres</h2>
              {org.subscriptions.length === 0 ? (
                <p className="mt-3 text-sm text-faint">Toujours resté sur Free.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {org.subscriptions.map((s, i) => (
                    <li key={i} className="flex flex-wrap justify-between gap-2 border-b border-border-soft pb-2 last:border-b-0">
                      <span className="text-ink">{s.planLabel}{s.paid ? '' : ' (attribuée)'}</span>
                      <span className="text-muted">{date(s.startedAt)} → {s.endsAt ? date(s.endsAt) : '…'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
