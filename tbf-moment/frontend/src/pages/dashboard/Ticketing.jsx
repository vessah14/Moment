import QRCode from 'qrcode'
import { Fragment, useEffect, useMemo, useState } from 'react'
import TicketSalesChart from '../../components/billing/TicketSalesChart'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import { listEvents } from '../../api/events'
import {
  createTicketType,
  deleteTicketType,
  listTicketSales,
  listTicketTypes,
  recordTicketSale,
} from '../../api/ticketing'

function statusFor(type) {
  if (type.soldCount >= type.quota) return 'Épuisé'
  if (type.soldCount / type.quota >= 0.8) return 'Limité'
  return 'En vente'
}

export default function Ticketing() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [ticketTypes, setTicketTypes] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [typeForm, setTypeForm] = useState(false)
  const [saleFormFor, setSaleFormFor] = useState('')
  const [ticketQrUrl, setTicketQrUrl] = useState(null)

  useEffect(() => {
    QRCode.toDataURL('TBF-2027-0X4J91', { margin: 1, width: 160 }).then(setTicketQrUrl)
  }, [])

  useEffect(() => {
    listEvents()
      .then((data) => {
        setEvents(data ?? [])
        if (data?.length) setSelectedEventId(data[0].id)
        else setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Impossible de charger vos événements.')
        setLoading(false)
      })
  }, [])

  const reload = (eventId) => {
    setLoading(true)
    Promise.all([listTicketTypes(eventId), listTicketSales(eventId)])
      .then(([typesData, salesData]) => {
        setTicketTypes(typesData ?? [])
        setSales(salesData ?? [])
        setError('')
      })
      .catch((err) => setError(err.message || 'Impossible de charger la billetterie.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedEventId) return
    reload(selectedEventId)
  }, [selectedEventId])

  const handleAddType = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const name = form.get('name')?.toString().trim()
    const priceCents = Number(form.get('price')) || 0
    const quota = Number(form.get('quota')) || 0
    if (!name || !quota) return
    setError('')
    try {
      await createTicketType({ name, priceCents, quota }, selectedEventId)
      setTypeForm(false)
      e.target.reset()
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'ajout a échoué.")
    }
  }

  const handleDeleteType = async (id) => {
    setError('')
    try {
      await deleteTicketType(id)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || 'La suppression a échoué.')
    }
  }

  const handleRecordSale = async (e, ticketTypeId) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const buyerName = form.get('buyerName')?.toString().trim()
    const buyerEmail = form.get('buyerEmail')?.toString().trim()
    if (!buyerName || !buyerEmail) return
    setError('')
    try {
      await recordTicketSale(ticketTypeId, { buyerName, buyerEmail })
      setSaleFormFor('')
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'enregistrement a échoué.")
    }
  }

  const totalSold = ticketTypes.reduce((sum, t) => sum + t.soldCount, 0)
  const totalQuota = ticketTypes.reduce((sum, t) => sum + t.quota, 0)
  const totalRevenueCents = ticketTypes.reduce((sum, t) => sum + t.soldCount * t.priceCents, 0)

  const salesChartData = useMemo(() => {
    const byDay = new Map()
    for (const s of sales) {
      const day = s.createdAt.slice(8, 10)
      byDay.set(day, (byDay.get(day) ?? 0) + 1)
    }
    return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, tickets]) => ({ day, tickets }))
  }, [sales])

  const STATS = [
    { label: 'Billets vendus', value: String(totalSold), hint: totalQuota ? `${Math.round((totalSold / totalQuota) * 100)}% des ${totalQuota} places` : '' },
    { label: 'Recettes', value: totalRevenueCents.toLocaleString('fr-FR'), hint: 'FCFA' },
    { label: 'Types de billets', value: String(ticketTypes.length) },
  ]

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-ink">Billetterie</h1>
        <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
          Créez d'abord un événement.
        </p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Billetterie</h1>
          <p className="mt-1.5 text-sm text-muted">
            Ventes enregistrées manuellement — aucun paiement en ligne n'est branché.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
          <Button variant="gradient" onClick={() => setTypeForm((v) => !v)}>
            Nouveau billet
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {typeForm && (
        <form
          onSubmit={handleAddType}
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
              type="number"
              min="0"
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

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border-soft bg-surface">
            <h2 className="px-6 pt-5 font-semibold text-ink">Types de billets</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-y border-border-soft text-xs tracking-wider text-faint uppercase">
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-3 py-3 font-medium">Prix</th>
                    <th className="px-3 py-3 font-medium">Quota</th>
                    <th className="px-3 py-3 font-medium">Statut</th>
                    <th className="px-3 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {!loading && ticketTypes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-faint">
                        Aucun type de billet.
                      </td>
                    </tr>
                  )}
                  {ticketTypes.map((ticket) => (
                    <Fragment key={ticket.id}>
                      <tr className="border-b border-border-soft last:border-b-0">
                        <td className="px-6 py-4 font-medium text-ink">{ticket.name}</td>
                        <td className="px-3 py-4 font-mono text-muted">
                          {ticket.priceCents.toLocaleString('fr-FR')}
                        </td>
                        <td className="px-3 py-4">
                          <p className="font-mono text-ink">
                            {ticket.soldCount}/{ticket.quota}
                          </p>
                          <div className="mt-1.5 h-1 w-24 rounded-full bg-border-soft">
                            <div
                              className="bg-brand-gradient h-full rounded-full"
                              style={{ width: `${Math.min((ticket.soldCount / ticket.quota) * 100, 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <StatusBadge status={statusFor(ticket)} />
                        </td>
                        <td className="px-3 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSaleFormFor(saleFormFor === ticket.id ? '' : ticket.id)}
                            disabled={ticket.soldCount >= ticket.quota}
                            className="text-xs font-medium text-brand-purple hover:underline disabled:pointer-events-none disabled:opacity-40"
                          >
                            Vente
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteType(ticket.id)}
                            className="ml-3 text-xs font-medium text-danger hover:underline"
                          >
                            Suppr.
                          </button>
                        </td>
                      </tr>
                      {saleFormFor === ticket.id && (
                        <tr>
                          <td colSpan={5} className="bg-surface-2/50 px-6 py-4">
                            <form
                              onSubmit={(e) => handleRecordSale(e, ticket.id)}
                              className="flex flex-wrap items-end gap-3"
                            >
                              <label className="block">
                                <span className="text-xs font-medium text-ink">Nom acheteur</span>
                                <input
                                  name="buyerName"
                                  required
                                  className="mt-1.5 w-40 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
                                />
                              </label>
                              <label className="block">
                                <span className="text-xs font-medium text-ink">Email</span>
                                <input
                                  name="buyerEmail"
                                  type="email"
                                  required
                                  className="mt-1.5 w-48 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
                                />
                              </label>
                              <Button type="submit" variant="gradient">
                                Enregistrer la vente
                              </Button>
                            </form>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-border-soft bg-panel p-5">
            <h2 className="font-semibold text-ink">Ventes par jour</h2>
            <div className="mt-3">
              <TicketSalesChart data={salesChartData} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border-soft bg-panel p-5">
            <h2 className="font-semibold text-ink">Dernières ventes</h2>
            <div className="mt-3 space-y-2">
              {sales.length === 0 && <p className="text-sm text-faint">Aucune vente encore.</p>}
              {sales.slice(0, 8).map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between rounded-lg border border-border-soft bg-surface px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{sale.buyerName}</p>
                    <p className="text-xs text-faint">{sale.ticketTypeName}</p>
                  </div>
                  <span className="text-xs text-faint">
                    {new Date(sale.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          </div>

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
              <div className="mt-4 flex aspect-square w-24 items-center justify-center overflow-hidden rounded-lg bg-white p-1.5">
                {ticketQrUrl && (
                  <img src={ticketQrUrl} alt="QR code du billet" className="h-full w-full" />
                )}
              </div>
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
        </div>
      </div>
    </DashboardLayout>
  )
}
