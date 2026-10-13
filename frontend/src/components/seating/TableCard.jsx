import { Trash2, X } from 'lucide-react'
import GuestPicker from './GuestPicker'

export default function TableCard({ table, guests, availableGuests, onSeat, onUnseat, onDelete }) {
  const seated = table.guestIds
    .map((id) => guests.find((g) => g.id === id))
    .filter(Boolean)
  const isFull = seated.length >= table.capacity

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{table.name}</h3>
          <p
            className={`mt-1 text-xs ${isFull ? 'text-brand-orange' : 'text-faint'}`}
          >
            {seated.length}/{table.capacity} places
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(table.id)}
          className="rounded-lg p-1.5 text-faint transition hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-border-soft">
        <div
          className={`h-full rounded-full transition-all ${isFull ? 'bg-brand-orange' : 'bg-brand-gradient'}`}
          style={{ width: `${Math.min((seated.length / table.capacity) * 100, 100)}%` }}
        />
      </div>

      <div className="mt-4 space-y-1.5">
        {seated.map((guest) => (
          <div
            key={guest.id}
            className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm"
          >
            <span className="text-ink">{guest.name}</span>
            <button
              type="button"
              onClick={() => onUnseat(guest.id)}
              className="text-faint hover:text-danger"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {!isFull && (
        <div className="mt-3">
          <GuestPicker
            availableGuests={availableGuests}
            onPick={(guestId) => onSeat(table.id, guestId)}
          />
        </div>
      )}
    </div>
  )
}
