import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import TableCard from '../../components/seating/TableCard'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { listEvents } from '../../api/events'
import { listGuests } from '../../api/guests'
import { assignGuest, createTable, deleteTable, listAssignments, listTables, unassignGuest } from '../../api/seating'

export default function SeatingPlan() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [guests, setGuests] = useState([])
  const [tables, setTables] = useState([])
  const [assignments, setAssignments] = useState([])
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
    Promise.all([listGuests(eventId), listTables(eventId), listAssignments(eventId)])
      .then(([guestsData, tablesData, assignmentsData]) => {
        setGuests(guestsData ?? [])
        setTables(tablesData ?? [])
        setAssignments(assignmentsData ?? [])
        setError('')
      })
      .catch((err) => setError(err.message || 'Impossible de charger le plan de table.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedEventId) return
    reload(selectedEventId)
  }, [selectedEventId])

  const guestOptions = useMemo(() => guests.map((g) => ({ id: g.id, name: g.fullName })), [guests])
  const assignedByTable = useMemo(() => {
    const map = new Map()
    for (const a of assignments) {
      if (!map.has(a.tableId)) map.set(a.tableId, [])
      map.get(a.tableId).push(a.guestId)
    }
    return map
  }, [assignments])
  const seatedIds = new Set(assignments.map((a) => a.guestId))
  const unassigned = guestOptions.filter((g) => !seatedIds.has(g.id))

  const tableCards = tables.map((t) => ({
    id: t.id,
    name: t.label,
    capacity: t.capacity,
    guestIds: assignedByTable.get(t.id) ?? [],
  }))

  const handleSeat = async (tableId, guestId) => {
    setError('')
    try {
      await assignGuest({ guestId, tableId }, selectedEventId)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'assignation a échoué.")
    }
  }

  const handleUnseat = async (guestId) => {
    setError('')
    try {
      await unassignGuest(guestId)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || 'Le retrait a échoué.')
    }
  }

  const handleDeleteTable = async (tableId) => {
    setError('')
    try {
      await deleteTable(tableId)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || 'La suppression a échoué.')
    }
  }

  const handleAddTable = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const label = form.get('name')?.toString().trim()
    const capacity = Number(form.get('capacity')) || 0
    if (!label || !capacity) return
    setError('')
    try {
      await createTable({ label, capacity, position: tables.length }, selectedEventId)
      setFormOpen(false)
      e.target.reset()
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "La création a échoué.")
    }
  }

  const totalSeated = seatedIds.size
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0)

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-ink">Plan de table</h1>
        <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
          Créez d'abord un événement avec des invités.
        </p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Plan de table</h1>
          <p className="mt-1.5 text-sm text-muted">
            {totalSeated}/{guests.length} invités placés · {tables.length} tables · {totalCapacity} places
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
            Ajouter une table
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

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

      {loading ? (
        <p className="mt-8 text-center text-sm text-faint">Chargement…</p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {tableCards.length === 0 && (
              <p className="col-span-full rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
                Aucune table pour le moment.
              </p>
            )}
            {tableCards.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                guests={guestOptions}
                availableGuests={unassigned}
                onSeat={handleSeat}
                onUnseat={handleUnseat}
                onDelete={handleDeleteTable}
              />
            ))}
          </div>

          <div className="h-fit rounded-2xl border border-border-soft bg-panel p-5 lg:sticky lg:top-8">
            <h2 className="font-semibold text-ink">Invités non placés</h2>
            <p className="mt-1 text-xs text-faint">{unassigned.length} invité(s) à assigner</p>
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
      )}
    </DashboardLayout>
  )
}
