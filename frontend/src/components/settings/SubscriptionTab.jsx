import { formatCents } from '../../utils/formatCurrency'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import { listMySubscriptions } from '../../api/subscriptions'

export default function SubscriptionTab() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listMySubscriptions()
      .then((data) => setSubscriptions(data ?? []))
      .catch((err) => setError(err.message || 'Impossible de charger votre abonnement.'))
      .finally(() => setLoading(false))
  }, [])

  const active = subscriptions.find((s) => s.status === 'Actif') ?? subscriptions[0]

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Abonnement</h2>
      <p className="mt-1 text-sm text-muted">
        Gérez votre formule et débloquez plus de modules pour vos événements.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-faint">Chargement…</p>
      ) : !active ? (
        <div className="mt-6 rounded-xl border border-border-soft bg-surface-2 p-5">
          <p className="text-sm text-muted">
            Aucun abonnement actif — vous utilisez la formule gratuite par défaut.
          </p>
          <Button as={Link} to="/tarifs" variant="gradient" className="mt-4">
            Voir les formules
          </Button>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-border-soft bg-surface-2 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs font-semibold tracking-wider text-brand-orange uppercase">
              Plan actuel · {active.planLabel}
            </span>
            <Button as={Link} to="/tarifs" variant="gradient">
              Changer de formule
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted">
            {formatCents(active.priceCents)} · {active.billing === 'Gratuit' ? 'Gratuit' : active.billing === 'Mensuel' ? '30 jours, sans renouvellement' : 'par an'}
          </p>
          <p className="mt-1 text-xs text-faint">
            Débuté le {new Date(active.startedAt).toLocaleDateString('fr-FR')}
            {active.endsAt && ` · résilié le ${new Date(active.endsAt).toLocaleDateString('fr-FR')}`}
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-faint">
        Comparez toutes les formules sur la{' '}
        <Link to="/tarifs" className="text-brand-purple hover:underline">
          page tarifs
        </Link>
        .
      </p>
    </div>
  )
}
