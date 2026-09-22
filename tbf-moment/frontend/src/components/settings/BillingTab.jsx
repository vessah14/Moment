import { useEffect, useState } from 'react'
import { listMySubscriptions } from '../../api/subscriptions'

export default function BillingTab() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listMySubscriptions()
      .then((data) => setSubscriptions(data ?? []))
      .finally(() => setLoading(false))
  }, [])

  const active = subscriptions.find((s) => s.status === 'Actif') ?? subscriptions[0]

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Facturation</h2>
      <p className="mt-1 text-sm text-muted">
        Aucune passerelle de paiement n'est branchée — moyen de paiement et factures ne
        sont pas encore disponibles.
      </p>

      <div className="mt-6 rounded-xl border border-border-soft bg-surface-2 p-5">
        <p className="text-sm font-semibold text-ink">Formule actuelle</p>
        {loading ? (
          <p className="mt-2 text-sm text-faint">Chargement…</p>
        ) : active ? (
          <p className="mt-2 text-sm text-muted">
            {active.planLabel} · {active.priceCents.toLocaleString('fr-FR')} FCFA
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">Formule gratuite</p>
        )}
      </div>

      <p className="mt-6 text-xs text-brand-orange">
        Moyen de paiement et historique des factures : bientôt disponible.
      </p>
    </div>
  )
}
