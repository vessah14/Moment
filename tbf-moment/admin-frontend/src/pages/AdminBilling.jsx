import { FileDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import AdminLayout from '../components/layout/AdminLayout'
import StatCard from '../components/dashboard/StatCard'
import Button from '../components/ui/Button'
import { listOrganizations, listTransactions } from '../api/platform'
import { formatFcfa } from '../utils/formatCurrency'

export default function AdminBilling() {
  const [organizations, setOrganizations] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listOrganizations(), listTransactions()])
      .then(([orgs, txs]) => {
        setOrganizations(orgs ?? [])
        setTransactions(txs ?? [])
        setError('')
      })
      .catch((err) => setError(err.message || 'Impossible de charger les données de facturation.'))
      .finally(() => setLoading(false))
  }, [])

  const mrr = transactions.reduce((sum, t) => sum + t.amountCents, 0)
  const payingAccounts = organizations.filter((o) => o.plan !== 'Free').length

  const byPlan = organizations.reduce((acc, org) => {
    acc[org.plan] = (acc[org.plan] ?? 0) + 1
    return acc
  }, {})

  const handleExport = () => {
    const header = 'Organisation,Plan,Montant,Date'
    const rows = transactions.map((t) =>
      [t.organization, t.plan, t.amountCents, t.date].join(','),
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'transactions.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Facturation</h1>
          <p className="mt-1.5 text-sm text-muted">
            Abonnements et transactions enregistrées sur la plateforme.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={transactions.length === 0}>
          <FileDown className="h-4 w-4" />
          Exporter les transactions
        </Button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="MRR (abonnements actifs)" value={formatFcfa(mrr)} />
        <StatCard label="Comptes payants" value={String(payingAccounts)} />
        <StatCard
          label="Panier moyen"
          value={formatFcfa(transactions.length ? Math.round(mrr / transactions.length) : 0)}
        />
        <StatCard label="Organisations" value={String(organizations.length)} />
      </div>

      <p className="mt-3 text-xs text-faint">
        Ces montants reflètent les abonnements enregistrés en base — aucune passerelle de
        paiement n'est branchée, donc aucun encaissement réel ne se produit encore.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-border-soft bg-surface p-5">
          <h2 className="font-semibold text-ink">Répartition par plan</h2>
          <div className="mt-4 space-y-3">
            {loading && <p className="text-sm text-faint">Chargement…</p>}
            {!loading &&
              Object.entries(byPlan).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{plan}</span>
                  <span className="font-mono text-muted">{count} compte(s)</span>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border-soft bg-surface">
          <h2 className="px-5 pt-5 font-semibold text-ink">Dernières transactions</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-y border-border-soft text-xs tracking-wider text-faint uppercase">
                  <th className="px-5 py-3 font-medium">Organisation</th>
                  <th className="px-3 py-3 font-medium">Plan</th>
                  <th className="px-3 py-3 font-medium">Montant</th>
                </tr>
              </thead>
              <tbody>
                {!loading && transactions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-6 text-center text-sm text-faint">
                      Aucune transaction.
                    </td>
                  </tr>
                )}
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-border-soft last:border-b-0">
                    <td className="px-5 py-4 text-ink">{t.organization}</td>
                    <td className="px-3 py-4 text-muted">{t.plan}</td>
                    <td className="px-3 py-4 font-mono text-ink">{formatFcfa(t.amountCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
