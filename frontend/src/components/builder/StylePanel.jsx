import { useState } from 'react'
import { Check } from 'lucide-react'
import TemplatePreview from '../templates/TemplatePreview'
import { getSiteTheme } from '../site/themes/themeDefs'
import FaqEditor from './FaqEditor'
import { DressCodeEditor, FamiliesEditor, GiftAccountsEditor, PartnersEditor, PeopleEditor } from './ModuleEditors'
import PremiumThemeFields from './PremiumThemeFields'
import Toggle from './Toggle'

const TABS = ['Style', 'Contenu', 'Modèle']

export default function StylePanel({
  palette,
  heroStyle,
  onChangeHeroStyle,
  selectedBlock,
  blockContent,
  onChangeBlockContent,
  templates = [],
  currentTemplate,
  categoryLabel,
  onApplyTemplate,
}) {
  const [tab, setTab] = useState('Style')

  const update = (patch) => onChangeHeroStyle({ ...heroStyle, ...patch })
  const isHero = selectedBlock === 'Hero'
  const content = blockContent[selectedBlock]
  // Modèle premium : ses palettes et motifs remplacent couleur et police libres.
  const premiumTheme = getSiteTheme(currentTemplate?.theme)

  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-l border-border-soft/60 p-5">
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

      {tab === 'Style' && premiumTheme && (
        <PremiumThemeFields theme={premiumTheme} heroStyle={heroStyle} onChange={update} />
      )}

      {tab === 'Style' && !premiumTheme && (
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

              {selectedBlock === 'Familles' && (
                <FamiliesEditor content={content} onChange={(patch) => onChangeBlockContent(selectedBlock, patch)} />
              )}
              {selectedBlock === 'Dress code' && (
                <DressCodeEditor content={content} onChange={(patch) => onChangeBlockContent(selectedBlock, patch)} />
              )}
              {selectedBlock === 'Intervenants' && (
                <PeopleEditor content={content} onChange={(patch) => onChangeBlockContent(selectedBlock, patch)} />
              )}
              {selectedBlock === 'Partenaires' && (
                <PartnersEditor content={content} onChange={(patch) => onChangeBlockContent(selectedBlock, patch)} />
              )}
              {selectedBlock === 'Cadeaux' && (
                <GiftAccountsEditor content={content} onChange={(patch) => onChangeBlockContent(selectedBlock, patch)} />
              )}

              {selectedBlock === 'FAQ' && (
                <FaqEditor
                  items={Array.isArray(content.items) ? content.items : []}
                  onChange={(items) => onChangeBlockContent(selectedBlock, { items })}
                />
              )}

              {selectedBlock === 'Localisation' && (
                <label className="block">
                  <span className="text-sm font-medium text-ink">Moyens de transport</span>
                  <textarea
                    rows={3}
                    value={content.transport ?? ''}
                    placeholder="Parking, transports en commun…"
                    onChange={(e) =>
                      onChangeBlockContent(selectedBlock, { transport: e.target.value })
                    }
                    className="mt-2 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-purple"
                  />
                </label>
              )}

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

      {tab === 'Modèle' && (
        <div className="mt-6">
          <p className="text-sm text-muted">
            {templates.length > 0
              ? `Modèles conçus pour « ${categoryLabel || 'cette catégorie'} ». Un clic applique ses couleurs, sa typographie et sa mise en page ; vos textes et photos sont conservés.`
              : `Aucun modèle n'est encore proposé pour « ${categoryLabel || 'cette catégorie'} ».`}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {templates.map((template) => {
              const isActive = currentTemplate?.name === template.name
              return (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => onApplyTemplate(template)}
                  className={`overflow-hidden rounded-xl border text-left transition ${
                    isActive
                      ? 'border-brand-purple ring-2 ring-brand-purple/40'
                      : 'border-border-soft hover:border-faint'
                  }`}
                >
                  <div className="relative aspect-4/5">
                    <TemplatePreview preview={template.preview} minimal={template.minimal} template={template} />
                    {isActive && (
                      <span className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-purple text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="bg-surface px-2.5 py-2">
                    <p className="text-xs font-semibold text-ink">{template.name}</p>
                    <p className="text-[10px] text-faint">
                      {template.badge === 'PREMIUM' ? 'Premium' : 'Gratuit'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <p className="mt-8 text-xs text-faint">
        Pensez à cliquer sur Enregistrer pour conserver vos modifications.
      </p>
    </aside>
  )
}
