import { useState } from 'react'
import StatusBadge from '../ui/StatusBadge'
import Button from '../ui/Button'
import { useToast } from '../../utils/useToast'

const INVOICES = [
  { id: 'FAC-2027-003', date: '01 mars 2027', amount: '15 000 FCFA', status: 'Payée' },
  { id: 'FAC-2027-002', date: '01 févr. 2027', amount: '15 000 FCFA', status: 'Payée' },
  { id: 'FAC-2027-001', date: '01 janv. 2027', amount: '15 000 FCFA', status: 'Payée' },
]

export default function BillingTab() {
  const toast = useToast()
  const [editingCard, setEditingCard] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setEditingCard(false)
    toast('Moyen de paiement mis à jour')
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Facturation</h2>
      <p className="mt-1 text-sm text-muted">
        Votre moyen de paiement et l'historique de vos factures.
      </p>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-border-soft bg-surface-2 p-5">
        <div>
          <p className="text-sm font-semibold text-ink">Visa •••• 4242</p>
          <p className="mt-0.5 text-xs text-faint">Expire 08/29</p>
        </div>
        <Button variant="outline" onClick={() => setEditingCard((v) => !v)}>
          Mettre à jour
        </Button>
      </div>

      {editingCard && (
        <form
          onSubmit={handleSave}
          className="mt-4 grid gap-4 rounded-xl border border-brand-purple/40 bg-surface p-5 sm:grid-cols-2"
        >
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-ink">Numéro de carte</span>
            <input
              required
              placeholder="4242 4242 4242 4242"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Expiration</span>
            <input
              required
              placeholder="MM/AA"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">CVC</span>
            <input
              required
              placeholder="123"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
            />
          </label>
          <Button type="submit" variant="gradient" className="sm:col-span-2">
            Enregistrer la carte
          </Button>
        </form>
      )}

      <h3 className="mt-8 text-sm font-semibold text-ink">Historique des factures</h3>
      <div className="mt-3 overflow-hidden rounded-xl border border-border-soft">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-soft text-xs tracking-wider text-faint uppercase">
              <th className="px-4 py-2.5 font-medium">Facture</th>
              <th className="px-3 py-2.5 font-medium">Date</th>
              <th className="px-3 py-2.5 font-medium">Montant</th>
              <th className="px-3 py-2.5 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((inv) => (
              <tr key={inv.id} className="border-b border-border-soft last:border-b-0">
                <td className="px-4 py-3 font-mono text-xs text-ink">{inv.id}</td>
                <td className="px-3 py-3 text-muted">{inv.date}</td>
                <td className="px-3 py-3 text-muted">{inv.amount}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={inv.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
