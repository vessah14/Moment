import { Check } from 'lucide-react'
import { getSiteTheme, themePalette } from '../site/themes/themeDefs'
import { findTemplate } from '../../utils/templateTheme'

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
  // Modèle premium : ses trois palettes et son accroche d'en-tête remplacent les couleurs génériques.
  const theme = getSiteTheme(findTemplate(event.template)?.theme)
  const selectedPalette = theme ? themePalette(theme, event.palette) : null

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">Personnalisez votre mini-site</h2>
      <p className="mt-2 text-sm text-muted">
        Choisissez une couleur d'accent et un message d'accroche — modifiables
        à tout moment dans le Builder.
      </p>

      {theme && (
        <div className="mt-8">
          <span className="text-sm font-medium text-ink">Ambiance du modèle {theme.name}</span>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {theme.palettes.map((p) => {
              const isSelected = selectedPalette?.id === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => update({ palette: p.id, themeColor: p.vars['--accent'] })}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${isSelected ? 'border-brand-purple ring-2 ring-brand-purple/30' : 'border-border hover:border-faint'}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: p.vars['--bg'], boxShadow: 'inset 0 0 0 1px rgba(127,127,127,.35)' }}>
                    <span className="h-4 w-4 rounded-full" style={{ background: p.vars['--accent'] }} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">{p.label}</span>
                    <span className="text-xs text-faint">{p.dark ? 'Sombre' : 'Clair'}</span>
                  </span>
                  {isSelected && <Check className="ml-auto h-4 w-4 shrink-0 text-brand-purple" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {theme && (
        <label className="mt-8 block">
          <span className="text-sm font-medium text-ink">Accroche de l'en-tête</span>
          <input
            type="text"
            value={event.kicker ?? ''}
            onChange={(e) => update({ kicker: e.target.value })}
            placeholder={`Ex: ${theme.kicker}`}
            maxLength={80}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
          />
          <span className="mt-1.5 block text-xs text-faint">Petite ligne au-dessus du titre. Vide : « {theme.kicker} ».</span>
        </label>
      )}

      {!theme && (
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
      )}

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
