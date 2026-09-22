import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import GiftCard from '../../components/gifts/GiftCard'
import StatCard from '../../components/dashboard/StatCard'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { listEvents } from '../../api/events'
import { createGiftItem, deleteGiftItem, listGiftItems } from '../../api/giftRegistry'

export default function GiftRegistry() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)

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
    listGiftItems(eventId)
      .then((data) => {
        setGifts(data ?? [])
        setError('')
      })
      .catch((err) => setError(err.message || 'Impossible de charger la liste.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedEventId) return
    reload(selectedEventId)
  }, [selectedEventId])

  const handleAddGift = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const name = form.get('name')?.toString().trim()
    const priceCents = Number(form.get('price')) || 0
    const description = form.get('description')?.toString().trim() || null
    if (!name || !priceCents) return
    setError('')
    try {
      await createGiftItem({ name, priceCents, description }, selectedEventId)
      setFormOpen(false)
      e.target.reset()
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'ajout a échoué.")
    }
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      await deleteGiftItem(id)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || 'La suppression a échoué.')
    }
  }

  const available = gifts.filter((g) => !g.isReserved).length
  const reserved = gifts.length - available

  const toCardProps = (gift) => ({
    id: gift.id,
    name: gift.name,
    description: gift.description,
    price: gift.priceCents,
    status: gift.isReserved ? 'reserved' : 'available',
    reservedBy: gift.reservedByName,
  })

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-ink">Liste de cadeaux</h1>
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
          <h1 className="text-2xl font-bold text-ink">Liste de cadeaux</h1>
          <p className="mt-1.5 text-sm text-muted">
            {gifts.length} cadeaux · {reserved} réservés ou offerts
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
          <Button variant="gradient" onClick={() => setFormOpen((v) => !v)}>
            <Plus className="h-4 w-4" />
            Ajouter un cadeau
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Cadeaux" value={String(gifts.length)} />
        <StatCard label="Disponibles" value={String(available)} hint="pas encore réservés" />
        <StatCard
          label="Réservés / offerts"
          value={String(reserved)}
          hint="par vos invités"
          hintColor="success"
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

      {loading ? (
        <p className="mt-8 text-center text-sm text-faint">Chargement…</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {gifts.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
              Aucun cadeau pour le moment.
            </p>
          )}
          {gifts.map((gift) => (
            <GiftCard key={gift.id} gift={toCardProps(gift)} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
