import { useState } from 'react'
import { THEME_PRESETS } from '../../data/blockDefaults'
import Toggle from './Toggle'

const TABS = ['Style', 'Contenu', 'Thème']

export default function StylePanel({
  palette,
  heroStyle,
  onChangeHeroStyle,
  selectedBlock,
  blockContent,
  onChangeBlockContent,
}) {
  const [tab, setTab] = useState('Style')

  const update = (patch) => onChangeHeroStyle({ ...heroStyle, ...patch })
  const isHero = selectedBlock === 'Hero'
  const content = blockContent[selectedBlock]

  return (
    <aside className="w-72 shrink-0 border-l border-border-soft/60 p-5">
      <div className="flex gap-1 rounded-lg bg-surface p-1 text-sm">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-1.5 font-medium transition ${
              tab === t ? 'bg-surface-2 text-ink' : 'text-faint hover:text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Style' && (
        <div className="mt-6 space-y-6">
          <div>
            <p className="text-sm font-medium text-ink">
              Palette de l'événement
            </p>
            <div className="mt-3 flex gap-2">
              {palette.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => update({ color: swatch })}
                  style={{ backgroundColor: swatch }}
                  className={`h-8 w-8 rounded-full transition ${
                    heroStyle.color === swatch
                      ? 'ring-2 ring-ink ring-offset-2 ring-offset-panel'
                      : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-ink">Typographie</span>
            <select
              value={heroStyle.font}
              onChange={(e) => update({ font: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-purple"
            >
              <option>Plus Jakarta Sans + DM Sans</option>
              <option>Inter + Inter</option>
              <option>Playfair Display + Inter</option>
            </select>
          </label>

          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink">Hauteur du bloc</span>
              <span className="font-mono text-faint">{heroStyle.blockHeight} vh</span>
            </div>
            <input
              type="range"
              min={40}
              max={100}
              value={heroStyle.blockHeight}
              onChange={(e) => update({ blockHeight: Number(e.target.value) })}
              className="mt-3 w-full accent-brand-purple"
            />
          </div>

          <Toggle
            label="Superposition sombre"
            checked={heroStyle.darkOverlay}
            onChange={(value) => update({ darkOverlay: value })}
          />
          <Toggle
            label="Animation d'entrée"
            checked={heroStyle.entryAnimation}
            onChange={(value) => update({ entryAnimation: value })}
          />

          <label className="block">
            <span className="text-sm font-medium text-ink">Titre</span>
            <input
              type="text"
              value={heroStyle.title}
              onChange={(e) => update({ title: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">Sous-titre</span>
            <input
              type="text"
              value={heroStyle.subtitle}
              onChange={(e) => update({ subtitle: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
        </div>
      )}

      {tab === 'Contenu' && (
        <div className="mt-6">
          {isHero ? (
            <p className="text-sm text-faint">
              Le titre et le sous-titre du Hero se modifient dans l'onglet
              Style.
            </p>
          ) : content ? (
            <div className="space-y-5">
              <p className="text-xs text-faint">
                Bloc sélectionné : <span className="text-ink">{selectedBlock}</span>
              </p>
              <label className="block">
                <span className="text-sm font-medium text-ink">Titre du bloc</span>
                <input
                  type="text"
                  value={content.heading}
                  onChange={(e) =>
                    onChangeBlockContent(selectedBlock, { heading: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-purple"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-ink">Texte</span>
                <textarea
                  rows={4}
                  value={content.body}
                  onChange={(e) =>
                    onChangeBlockContent(selectedBlock, { body: e.target.value })
                  }
                  className="mt-2 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-purple"
                />
              </label>

              <div className="space-y-4 border-t border-border-soft pt-4">
                <p className="text-xs font-semibold tracking-wider text-faint uppercase">
                  Options d'affichage
                </p>
                <Toggle
                  label="Afficher le titre de section"
                  checked={Boolean(content.showHeading)}
                  onChange={(value) =>
                    onChangeBlockContent(selectedBlock, { showHeading: value })
                  }
                />
                <Toggle
                  label="Arrière-plan teinté"
                  checked={Boolean(content.tinted)}
                  onChange={(value) =>
                    onChangeBlockContent(selectedBlock, { tinted: value })
                  }
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-faint">
              Sélectionnez un bloc dans l'aperçu pour modifier son contenu.
            </p>
          )}
        </div>
      )}

      {tab === 'Thème' && (
        <div className="mt-6">
          <p className="text-sm text-muted">
            Un thème applique en un clic une couleur et une typographie au
            Hero de votre page.
          </p>
          <div className="mt-4 space-y-2">
            {THEME_PRESETS.map((preset) => {
              const isActive =
                heroStyle.color === preset.color && heroStyle.font === preset.font
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    update({
                      color: preset.color,
                      font: preset.font,
                      darkOverlay: preset.darkOverlay,
                    })
                  }
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                    isActive
                      ? 'border-brand-purple bg-brand-purple/10'
                      : 'border-border-soft hover:border-faint'
                  }`}
                >
                  <span
                    className="h-6 w-6 shrink-0 rounded-full"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink">
                      {preset.name}
                    </span>
                    <span className="block text-xs text-faint">{preset.font}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <p className="mt-8 text-xs text-faint">
        Les modifications sont enregistrées automatiquement.
      </p>
    </aside>
  )
}
