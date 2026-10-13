import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function GuestPicker({ availableGuests, onPick }) {
  const [open, setOpen] = useState(false)

  if (availableGuests.length === 0) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted transition hover:border-brand-purple hover:text-brand-purple"
      >
        <Plus className="h-3.5 w-3.5" />
        Ajouter un invité
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute top-full left-0 z-50 mt-2 max-h-48 w-full overflow-y-auto rounded-lg border border-border-soft bg-panel p-1.5 shadow-xl">
            {availableGuests.map((guest) => (
              <button
                key={guest.id}
                type="button"
                onClick={() => {
                  onPick(guest.id)
                  setOpen(false)
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
              >
                {guest.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
