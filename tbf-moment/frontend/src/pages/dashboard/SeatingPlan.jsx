import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import TableCard from '../../components/seating/TableCard'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { INITIAL_TABLES, SEATING_GUESTS } from '../../data/seatingGuests'

export default function SeatingPlan() {
  const [tables, setTables] = useState(INITIAL_TABLES)
  const [formOpen, setFormOpen] = useState(false)

  const seatedIds = useMemo(
    () => new Set(tables.flatMap((t) => t.guestIds)),
    [tables],
  )
  const unassigned = SEATING_GUESTS.filter((g) => !seatedIds.has(g.id))

  const handleSeat = (tableId, guestId) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, guestIds: [...t.guestIds, guestId] } : t,
      ),
    )
  }

  const handleUnseat = (guestId) => {
    setTables((prev) =>
      prev.map((t) => ({
        ...t,
        guestIds: t.guestIds.filter((id) => id !== guestId),
      })),
    )
  }

  const handleDeleteTable = (tableId) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId))
  }

  const handleAddTable = (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const name = form.get('name')?.toString().trim()
    const capacity = Number(form.get('capacity')) || 0
    if (!name || !capacity) return
    setTables((prev) => [
      ...prev,
      { id: `t-${Date.now()}`, name, capacity, guestIds: [] },
    ])
    setFormOpen(false)
    e.target.reset()
  }

  const totalSeated = seatedIds.size
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0)

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Plan de table — Mariage Awa & Ibrahim
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {totalSeated}/{SEATING_GUESTS.length} invités placés ·{' '}
            {tables.length} tables · {totalCapacity} places
          </p>
        </div>
        <Button variant="gradient" onClick={() => setFormOpen((v) => !v)}>
          <Plus className="h-4 w-4" />
          Ajouter une table
        </Button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleAddTable}
          className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-purple/40 bg-surface p-5"
        >
          <label className="block">
            <span className="text-xs font-medium text-ink">Nom de la table</span>
            <input
              name="name"
              required
              placeholder="Table 4 · Voisins"
              className="mt-1.5 w-56 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Capacité</span>
            <input
              name="capacity"
              type="number"
              min="1"
              defaultValue={8}
              required
              className="mt-1.5 w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <Button type="submit" variant="gradient">
            Créer
          </Button>
        </form>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              guests={SEATING_GUESTS}
              availableGuests={unassigned}
              onSeat={handleSeat}
              onUnseat={handleUnseat}
              onDelete={handleDeleteTable}
            />
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-border-soft bg-panel p-5 lg:sticky lg:top-8">
          <h2 className="font-semibold text-ink">Invités non placés</h2>
          <p className="mt-1 text-xs text-faint">
            {unassigned.length} invité(s) à assigner
          </p>
          <div className="mt-4 space-y-1.5">
            {unassigned.length === 0 ? (
              <p className="text-sm text-success">Tous les invités sont placés.</p>
            ) : (
              unassigned.map((guest) => (
                <div
                  key={guest.id}
                  className="rounded-lg border border-border-soft px-3 py-2 text-sm text-ink"
                >
                  {guest.name}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
