import { Check } from 'lucide-react'

const COLORS = [
  { value: '#6549e8', name: 'Violet' },
  { value: '#ec4ec2', name: 'Magenta' },
  { value: '#ff7a3d', name: 'Orange' },
  { value: '#f6c945', name: 'Or' },
  { value: '#c026d3', name: 'Fuchsia' },
  { value: '#22c55e', name: 'Émeraude' },
]

export default function PersonalizationStep({ event, onChange }) {
  const update = (patch) => onChange({ ...event, ...patch })

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">Personnalisez votre mini-site</h2>
      <p className="mt-2 text-sm text-muted">
        Choisissez une couleur d'accent et un message d'accroche — modifiables
        à tout moment dans le Builder.
      </p>

      <div className="mt-8">
        <span className="text-sm font-medium text-ink">Couleur d'accent</span>
        <div className="mt-3 flex flex-wrap gap-3">
          {COLORS.map((color) => {
            const isSelected = event.themeColor === color.value
            return (
              <button
                key={color.value}
                type="button"
                title={color.name}
                onClick={() => update({ themeColor: color.value })}
                className="flex h-11 w-11 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-bg transition"
                style={{
                  backgroundColor: color.value,
                  '--tw-ring-color': isSelected ? color.value : 'transparent',
                }}
              >
                {isSelected && <Check className="h-4 w-4 text-white" />}
              </button>
            )
          })}
        </div>
      </div>

      <label className="mt-8 block">
        <span className="text-sm font-medium text-ink">
          Message d'accroche (optionnel)
        </span>
        <input
          type="text"
          value={event.tagline}
          onChange={(e) => update({ tagline: e.target.value })}
          placeholder="Ex: On se dit oui !"
          maxLength={60}
          className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
        />
        <span className="mt-1.5 block text-xs text-faint">
          Affiché en haut de votre page publique, sous le titre.
        </span>
      </label>

      <div
        className="mt-8 overflow-hidden rounded-2xl border border-border-soft"
        style={{ boxShadow: `0 0 0 1px ${event.themeColor}22` }}
      >
        <div
          className="flex aspect-21/9 flex-col items-center justify-center gap-2 px-6 text-center"
          style={{
            background: `linear-gradient(160deg, ${event.themeColor}33, var(--color-surface))`,
          }}
        >
          <p className="font-serif text-xl font-bold text-ink">
            {event.name || 'Nom de votre événement'}
          </p>
          {event.tagline && <p className="text-sm text-muted">{event.tagline}</p>}
          <span
            className="mt-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: event.themeColor }}
          >
            Aperçu de la couleur
          </span>
        </div>
      </div>
    </div>
  )
}
