import { Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { EVENT_CATEGORIES } from '../../data/eventCategories'
import { TEMPLATES } from '../../data/templates'

const FILTERS = ['Tous', 'Recommandés', 'Premium', 'Minimal']

export default function TemplateStep({ category, selected, onSelect }) {
  const [filter, setFilter] = useState('Recommandés')

  const templateCategory = EVENT_CATEGORIES.find(
    (c) => c.label === category,
  )?.templateCategory

  const matches = TEMPLATES.filter((tpl) => {
    if (filter === 'Recommandés') return tpl.category === templateCategory
    if (filter === 'Premium') return tpl.badge === 'PREMIUM'
    if (filter === 'Minimal') return Boolean(tpl.minimal)
    return true
  })

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">
            Choisissez un point de départ
          </h2>
          <p className="mt-2 text-sm text-muted">
            Un modèle prêt à publier, ou une page vierge à composer librement
            dans le Builder.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === f
                  ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                  : 'border border-border text-muted hover:border-faint hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {matches.map((tpl) => {
          const isSelected = selected === tpl.name
          return (
            <button
              key={tpl.name}
              type="button"
              onClick={() => onSelect(tpl.name)}
              className={`relative overflow-hidden rounded-2xl text-left ${
                isSelected ? 'ring-2 ring-brand-purple' : ''
              }`}
            >
              <div className="relative aspect-4/5 bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-panel))]">
                <span
                  className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${
                    tpl.badge === 'PREMIUM'
                      ? 'bg-[color:var(--color-gold)] text-bg'
                      : 'bg-black/50 text-ink'
                  }`}
                >
                  {tpl.badge}
                </span>
                {isSelected && (
                  <span className="absolute top-3 left-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-purple text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <div className="bg-surface px-3 py-3">
                <p className="font-medium text-ink">{tpl.name}</p>
                <p className="mt-0.5 text-xs text-faint">{tpl.meta}</p>
              </div>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => onSelect('Page vierge')}
          className={`flex aspect-4/5 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center transition ${
            selected === 'Page vierge'
              ? 'border-brand-purple bg-brand-purple/10'
              : 'border-border hover:border-faint'
          }`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2">
            <Plus className="h-4 w-4 text-muted" />
          </span>
          <span className="text-sm font-medium text-ink">Page vierge</span>
          <span className="max-w-[9rem] text-xs text-faint">
            Composer librement dans le Builder
          </span>
        </button>
      </div>

      {matches.length === 0 && (
        <p className="mt-4 text-xs text-faint">
          Pas encore de modèle dans ce filtre — la page vierge reste un
          excellent point de départ.
        </p>
      )}
    </div>
  )
}
