import { Plus } from 'lucide-react'
import { useState } from 'react'
import CagnottePanel from '../../components/gifts/CagnottePanel'
import GiftCard from '../../components/gifts/GiftCard'
import StatCard from '../../components/dashboard/StatCard'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { INITIAL_CAGNOTTE, INITIAL_GIFTS } from '../../data/giftRegistry'

export default function GiftRegistry() {
  const [gifts, setGifts] = useState(INITIAL_GIFTS)
  const [cagnotte] = useState(INITIAL_CAGNOTTE)
  const [formOpen, setFormOpen] = useState(false)

  const handleAddGift = (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const name = form.get('name')?.toString().trim()
    const price = Number(form.get('price')) || 0
    const description = form.get('description')?.toString().trim() || ''
    if (!name || !price) return
    setGifts((prev) => [
      ...prev,
      { id: Date.now(), name, price, description, status: 'available', reservedBy: null },
    ])
    setFormOpen(false)
    e.target.reset()
  }

  const handleDelete = (id) => setGifts((prev) => prev.filter((g) => g.id !== id))

  const available = gifts.filter((g) => g.status === 'available').length
  const reservedOrGiven = gifts.length - available

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Liste de mariage — Mariage Awa & Ibrahim
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {gifts.length} cadeaux · {reservedOrGiven} réservés ou offerts
          </p>
        </div>
        <Button variant="gradient" onClick={() => setFormOpen((v) => !v)}>
          <Plus className="h-4 w-4" />
          Ajouter un cadeau
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Cadeaux" value={String(gifts.length)} />
        <StatCard label="Disponibles" value={String(available)} hint="pas encore réservés" />
        <StatCard
          label="Réservés / offerts"
          value={String(reservedOrGiven)}
          hint="par vos invités"
          hintColor="success"
        />
        <StatCard
          label="Cagnotte"
          value={`${Math.round((cagnotte.raised / cagnotte.target) * 100)}%`}
          hint="de l'objectif"
        />
      </div>

      {formOpen && (
        <form
          onSubmit={handleAddGift}
          className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-purple/40 bg-surface p-5"
        >
          <label className="block">
            <span className="text-xs font-medium text-ink">Nom du cadeau</span>
            <input
              name="name"
              required
              className="mt-1.5 w-48 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Prix (FCFA)</span>
            <input
              name="price"
              type="number"
              min="1"
              required
              className="mt-1.5 w-32 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block flex-1">
            <span className="text-xs font-medium text-ink">Description</span>
            <input
              name="description"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <Button type="submit" variant="gradient">
            Ajouter
          </Button>
        </form>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {gifts.map((gift) => (
            <GiftCard key={gift.id} gift={gift} onDelete={handleDelete} />
          ))}
        </div>

        <CagnottePanel cagnotte={cagnotte} />
      </div>
    </DashboardLayout>
  )
}
