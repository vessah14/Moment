import { MOTIFS, motifStyle } from '../site/themes/motifs'
import { themeMotif, themePalette } from '../site/themes/themeDefs'

const inputClass =
  'mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-purple'

// Réglages d'un modèle premium (Noor, Bloom…) : ils ont leurs propres palettes et motifs,
// à la place de la couleur et de la police libres des modèles classiques.
export default function PremiumThemeFields({ theme, heroStyle, onChange }) {
  const palette = themePalette(theme, heroStyle.palette)
  const motif = themeMotif(theme, heroStyle.motif)

  return (
    <div className="mt-6 space-y-6">
      <p className="rounded-lg bg-surface-2/60 px-3 py-2.5 text-xs text-muted">
        Modèle premium <span className="font-semibold text-ink">{theme.name}</span> : ouverture
        animée, fond animé et musique sont visibles sur le site publié.
      </p>

      <fieldset>
        <legend className="text-sm font-medium text-ink">Palette</legend>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {theme.palettes.map((p) => {
            const active = p.id === palette.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ palette: p.id })}
                aria-pressed={active}
                className="grid gap-1.5 text-center text-[11px] text-muted"
              >
                <span
                  className={`grid aspect-square grid-cols-2 overflow-hidden rounded-xl border-2 transition ${
                    active ? 'border-brand-purple' : 'border-border-soft'
                  }`}
                >
                  {['--bg', '--surface-2', '--accent', '--accent-2'].map((k) => (
                    <i key={k} style={{ background: p.vars[k] }} />
                  ))}
                </span>
                {p.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-ink">Motif d'arrière-plan</legend>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {theme.motifs.map((m) => {
            const active = m === motif
            const style = motifStyle(m, palette, 0.6)
            return (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ motif: m })}
                aria-pressed={active}
                className="grid gap-1 text-center text-[10px] text-muted"
              >
                <span
                  className={`block aspect-square rounded-lg border-2 transition ${
                    active ? 'border-brand-purple' : 'border-border-soft'
                  }`}
                  style={{ backgroundColor: palette.vars['--bg'], ...style }}
                />
                {MOTIFS[m]?.label ?? m}
              </button>
            )
          })}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium text-ink">Accroche de l'en-tête</span>
        <input
          type="text"
          maxLength={80}
          value={heroStyle.kicker ?? ''}
          placeholder={theme.kicker}
          onChange={(e) => onChange({ kicker: e.target.value })}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Titre</span>
        <input
          type="text"
          value={heroStyle.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className={inputClass}
        />
        <span className="mt-1.5 block text-xs text-faint">
          « Prénom & Prénom » affiche deux noms ; « Les 30 ans de… » affiche le grand chiffre
          sur Fiesta et Prestige.
        </span>
      </label>
    </div>
  )
}
