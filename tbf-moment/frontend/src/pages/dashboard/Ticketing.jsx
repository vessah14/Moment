import { useState } from 'react'
import TicketSalesChart from '../../components/billing/TicketSalesChart'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'

const STATS = [
  { label: 'Billets vendus', value: '318', hint: '64% des 500 places' },
  {
    label: 'Recettes nettes',
    value: '4 264 000',
    hint: 'FCFA · versement le 05/06',
  },
  {
    label: 'Panier moyen',
    value: '13 400',
    hint: '+8% sur 7 jours',
    hintColor: 'success',
  },
  { label: 'Coupons', value: '46', hint: '3 codes actifs' },
]

const INITIAL_TICKET_TYPES = [
  {
    name: 'Early bird',
    price: '10 000',
    sold: 150,
    quota: 150,
    status: 'Épuisé',
  },
  {
    name: 'Standard',
    price: '15 000',
    sold: 142,
    quota: 250,
    status: 'En vente',
  },
  {
    name: 'VIP · accès lounge',
    subtitle: 'Déjeuner et replay inclus',
    price: '35 000',
    sold: 26,
    quota: 50,
    status: 'Limité',
  },
  {
    name: 'Étudiant',
    price: '5 000',
    sold: 0,
    quota: 50,
    status: 'Programmé',
  },
]

const INITIAL_COUPONS = [
  { code: 'TBF20', discount: '-20%', used: '31 utilisés' },
  { code: 'PARTENAIRE', discount: '-50%', used: '12 utilisés' },
  { code: 'ETUDIANT', discount: '-70%', used: '3 utilisés' },
]

export default function Ticketing() {
  const [ticketTypes, setTicketTypes] = useState(INITIAL_TICKET_TYPES)
  const [coupons, setCoupons] = useState(INITIAL_COUPONS)
  const [ticketForm, setTicketForm] = useState(null)
  const [couponForm, setCouponForm] = useState(null)

  const handleAddTicket = (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const name = form.get('name')?.toString().trim()
    const price = form.get('price')?.toString().trim()
    const quota = Number(form.get('quota')) || 0
    if (!name || !price || !quota) return
    setTicketTypes((prev) => [
      ...prev,
      { name, price, sold: 0, quota, status: 'Programmé' },
    ])
    setTicketForm(null)
  }

  const handleAddCoupon = (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const code = form.get('code')?.toString().trim().toUpperCase()
    const discount = form.get('discount')?.toString().trim()
    if (!code || !discount) return
    setCoupons((prev) => [...prev, { code, discount, used: '0 utilisé' }])
    setCouponForm(null)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Billetterie</h1>
          <p className="mt-1.5 text-sm text-success">
            Paiement en ligne actif · commission 2,5%
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCouponForm((v) => !v)}>
            Créer un coupon
          </Button>
          <Button variant="gradient" onClick={() => setTicketForm((v) => !v)}>
            Nouveau billet
          </Button>
        </div>
      </div>

      {ticketForm && (
        <form
          onSubmit={handleAddTicket}
          className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-purple/40 bg-surface p-5"
        >
          <label className="block">
            <span className="text-xs font-medium text-ink">Nom du billet</span>
            <input
              name="name"
              required
              className="mt-1.5 w-40 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Prix (FCFA)</span>
            <input
              name="price"
              required
              className="mt-1.5 w-32 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Quota</span>
            <input
              name="quota"
              type="number"
              min="1"
              required
              className="mt-1.5 w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <Button type="submit" variant="gradient">
            Ajouter
          </Button>
        </form>
      )}

      {couponForm && (
        <form
          onSubmit={handleAddCoupon}
          className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-purple/40 bg-surface p-5"
        >
          <label className="block">
            <span className="text-xs font-medium text-ink">Code</span>
            <input
              name="code"
              required
              className="mt-1.5 w-32 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Réduction</span>
            <input
              name="discount"
              placeholder="-20%"
              required
              className="mt-1.5 w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <Button type="submit" variant="gradient">
            Ajouter
          </Button>
        </form>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border-soft bg-surface">
            <h2 className="px-6 pt-5 font-semibold text-ink">Types de billets</h2>
            <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-y border-border-soft text-xs tracking-wider text-faint uppercase">
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium">Prix</th>
                  <th className="px-3 py-3 font-medium">Quota</th>
                  <th className="px-3 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {ticketTypes.map((ticket) => (
                  <tr key={ticket.name} className="border-b border-border-soft last:border-b-0">
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink">{ticket.name}</p>
                      {ticket.subtitle && (
                        <p className="text-xs text-brand-orange">{ticket.subtitle}</p>
                      )}
                    </td>
                    <td className="px-3 py-4 font-mono text-muted">{ticket.price}</td>
                    <td className="px-3 py-4">
                      <p className="font-mono text-ink">
                        {ticket.sold}/{ticket.quota}
                      </p>
                      <div className="mt-1.5 h-1 w-24 rounded-full bg-border-soft">
                        <div
                          className="bg-brand-gradient h-full rounded-full"
                          style={{ width: `${(ticket.sold / ticket.quota) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          <div className="rounded-2xl border border-border-soft bg-panel p-5">
            <h2 className="font-semibold text-ink">Ventes sur 30 jours</h2>
            <div className="mt-3">
              <TicketSalesChart />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border-soft bg-panel p-5">
            <h2 className="font-semibold text-ink">Billet numérique</h2>
            <div className="mt-4 rounded-xl border border-border-soft bg-surface p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">TBF Summit 2027</p>
                  <p className="text-xs text-faint">02 juin 2027 · 09:00 · Dakar Arena</p>
                </div>
                <StatusBadge status="VIP" />
              </div>
              <div className="mt-4 flex aspect-square w-24 items-center justify-center rounded-lg bg-[repeating-linear-gradient(45deg,_var(--color-surface-2),_var(--color-surface-2)_4px,_var(--color-panel)_4px,_var(--color-panel)_8px)]" />
              <div className="mt-3">
                <p className="text-sm font-medium text-ink">Aminata Bâ</p>
                <p className="text-xs text-faint">
                  TBF-2027-0X4J91 · Lounge · déjeuner inclus
                </p>
              </div>
              <p className="mt-3 text-xs text-faint">
                QR invalide après le premier scan
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border-soft bg-panel p-5">
            <h2 className="font-semibold text-ink">Coupons actifs</h2>
            <div className="mt-3 space-y-2">
              {coupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="flex items-center justify-between rounded-lg border border-border-soft bg-surface px-4 py-3"
                >
                  <span className="font-mono text-sm font-semibold text-brand-purple">
                    {coupon.code}
                  </span>
                  <span className="text-xs text-muted">
                    {coupon.discount} · {coupon.used}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
