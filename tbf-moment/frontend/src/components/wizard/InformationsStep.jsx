import { Plus } from 'lucide-react'

export default function InformationsStep({ event, onChange }) {
  const locations = event.locations ?? []

  const update = (patch) => onChange({ ...event, ...patch })

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">
        Informations de l'événement
      </h2>
      <p className="mt-2 text-sm text-muted">
        Ces éléments alimentent automatiquement le site et les invitations.
      </p>

      <form onSubmit={(e) => e.preventDefault()} className="mt-8 space-y-6">
        <label className="block">
          <span className="text-sm font-medium text-ink">
            Nom de l'événement
          </span>
          <input
            type="text"
            value={event.name}
            onChange={(e) => update({ name: e.target.value })}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-ink">Date</span>
            <input
              type="text"
              value={event.date}
              onChange={(e) => update({ date: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Heure</span>
            <input
              type="text"
              value={event.time}
              onChange={(e) => update({ time: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Fuseau</span>
            <input
              type="text"
              value={event.timezone}
              onChange={(e) => update({ timezone: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
          </label>
        </div>

        <div>
          <span className="text-sm font-medium text-ink">Lieux</span>
          <div className="mt-2 space-y-2">
            {locations.map((loc, index) => (
              <div
                key={`${loc.name}-${index}`}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
              >
                <span className="text-sm text-ink">{loc.name}</span>
                <span className="text-xs text-faint">{loc.type}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              update({
                locations: [
                  ...locations,
                  { name: 'Nouveau lieu', type: 'Étape' },
                ],
              })
            }
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-purple hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter un lieu
          </button>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-ink">Description</span>
          <textarea
            rows={3}
            value={event.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Quelques lignes de présentation pour vos invités..."
            className="mt-2 w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">
            Image de couverture
          </span>
          <div
            className="relative mt-2 flex aspect-21/9 cursor-pointer items-end overflow-hidden rounded-lg bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-surface))] bg-cover bg-center"
            style={
              event.coverImage
                ? { backgroundImage: `url(${event.coverImage})` }
                : undefined
            }
          >
            <span className="w-full bg-black/40 px-4 py-2 text-xs text-ink/80">
              {event.coverImage
                ? "Changer l'image · 1920×1080 · WebP"
                : 'Parcourir une image · 1920×1080 · WebP'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (event.coverImage) URL.revokeObjectURL(event.coverImage)
                update({ coverImage: URL.createObjectURL(file) })
              }}
            />
          </div>
        </label>
      </form>
    </div>
  )
}
