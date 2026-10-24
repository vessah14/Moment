import { Search } from 'lucide-react'
import { useState } from 'react'

const BLOCKS = [
  'Hero',
  'Invitation',
  'Histoire',
  'Programme',
  'Galerie',
  'Vidéo',
  'Intervenants',
  'Rebours',
  'RSVP',
  'Localisation',
  'Billetterie',
  'FAQ',
  "Livre d'or",
  'Familles',
  'Dress code',
  'Cadeaux',
  'Partenaires',
  'Plan de table',
  'Pied de page',
]

const PREMIUM_BLOCKS = new Set(['Plan de table'])
const ALWAYS_PRESENT = new Set(['Hero'])

export default function BlockLibrary({ pageBlocks, selected, onSelect }) {
  const [query, setQuery] = useState('')

  const visibleBlocks = BLOCKS.filter((block) =>
    block.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <aside className="w-56 shrink-0 border-r border-border-soft/60 p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher un bloc"
          className="w-full rounded-lg border border-border bg-surface py-2 pr-3 pl-9 text-xs text-ink placeholder:text-faint outline-none focus:border-brand-purple"
        />
      </div>

      <p className="mt-5 text-xs font-semibold tracking-wider text-faint uppercase">
        Structure
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {visibleBlocks.map((block) => {
          const isSelected = block === selected
          const isPremium = PREMIUM_BLOCKS.has(block)
          const isOnPage = ALWAYS_PRESENT.has(block) || pageBlocks.includes(block)
          return (
            <button
              key={block}
              type="button"
              onClick={() => onSelect(block)}
              className={`relative rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition ${
                isSelected
                  ? isPremium
                    ? 'border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]'
                    : 'border-brand-purple bg-brand-purple/10 text-ink'
                  : isPremium
                    ? 'border-[color:var(--color-gold)]/60 text-[color:var(--color-gold)] hover:border-[color:var(--color-gold)]'
                    : 'border-border-soft text-muted hover:border-faint hover:text-ink'
              }`}
            >
              {block}
              {isOnPage && (
                <span
                  className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-success"
                  title="Déjà sur la page"
                />
              )}
            </button>
          )
        })}
        {visibleBlocks.length === 0 && (
          <p className="col-span-2 py-4 text-center text-xs text-faint">
            Aucun bloc « {query} ».
          </p>
        )}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-faint">
        Cliquez un bloc pour l'ajouter à votre page. Les blocs gold
        nécessitent un plan Premium.
      </p>
    </aside>
  )
}
