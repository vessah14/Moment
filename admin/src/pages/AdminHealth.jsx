import { useEffect, useState } from 'react'
import { getSystemHealth } from '../api/platform'
import AdminLayout from '../components/layout/AdminLayout'
import StatusBadge from '../components/ui/StatusBadge'

const formatDate = (value) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value))

export default function AdminHealth() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSystemHealth()
      .then(setHealth)
      .catch((err) => setError(err.message || 'Impossible de joindre le service de santé.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <header>
        <h1 className="text-2xl font-bold text-ink">Santé technique</h1>
        <p className="mt-1.5 text-sm text-muted">
          Disponibilité de l’API et de la base, et erreurs observées depuis l’activation du journal.
        </p>
      </header>

      {error && (
        <p className="mt-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          API indisponible ou migration de télémétrie non appliquée : {error}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-border-soft bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-faint uppercase">API</p>
              <p className="mt-2 text-sm text-muted">API et contrôleur santé joignables.</p>
            </div>
            {loading ? <span className="text-sm text-faint">Vérification…</span> : (
              <StatusBadge status={health ? 'Disponible' : 'Refus'} />
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-border-soft bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-faint uppercase">Base de données</p>
              <p className="mt-2 text-sm text-muted">Test de connexion effectué par l’API.</p>
            </div>
            {loading ? <span className="text-sm text-faint">Vérification…</span> : (
              <StatusBadge status={health?.databaseAvailable ? 'Disponible' : 'Refus'} />
            )}
          </div>
        </section>
      </div>

      {health && (
        <>
          <section className="mt-6 rounded-2xl border border-border-soft bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-ink">Erreurs des dernières 24 heures</h2>
                <p className="mt-1 text-sm text-muted">
                  {health.errorsLast24Hours} erreur(s) enregistrée(s) · contrôlé le {formatDate(health.checkedAt)}
                </p>
              </div>
              <p className="max-w-xl text-xs text-faint">
                L’historique commence après l’application de la migration et le déploiement. Les erreurs antérieures ne sont pas reconstituables.
              </p>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-border-soft bg-surface">
            <div className="px-5 py-4">
              <h2 className="font-semibold text-ink">Erreurs enregistrées</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-y border-border-soft text-xs tracking-wider text-faint uppercase">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Type</th>
                    <th className="px-3 py-3 font-medium">Route</th>
                    <th className="px-3 py-3 font-medium">HTTP</th>
                  </tr>
                </thead>
                <tbody>
                  {health.recentErrors.length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-faint">Aucune erreur enregistrée pendant cette période.</td></tr>
                  )}
                  {health.recentErrors.map((item, index) => (
                    <tr key={`${item.createdAt}-${index}`} className="border-b border-border-soft last:border-b-0">
                      <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDate(item.createdAt)}</td>
                      <td className="px-3 py-3 text-ink">{item.category}</td>
                      <td className="px-3 py-3 font-mono text-xs text-muted">{item.route}</td>
                      <td className="px-3 py-3 text-danger">{item.statusCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  )
}
