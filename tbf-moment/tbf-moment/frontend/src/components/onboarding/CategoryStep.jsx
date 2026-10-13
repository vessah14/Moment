import { Check } from 'lucide-react'
import { EVENT_CATEGORIES } from '../../data/eventCategories'

export default function CategoryStep({ selected, onSelect }) {
  return (
    <div>
      <h2 className="text-center text-2xl font-bold text-ink">
        Quel type d'événement organisez-vous ?
      </h2>
      <p className="mt-2 text-center text-sm text-muted">
        Ce choix personnalise les modules suggérés et les modèles proposés
        par la suite.
      </p>

      <div className="mt-8 grid max-h-96 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
        {EVENT_CATEGORIES.map((cat) => {
          const isSelected = cat.label === selected
          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => onSelect(cat.label)}
              className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                isSelected
                  ? 'border-brand-purple bg-brand-purple/10'
                  : 'border-border-soft bg-surface hover:border-faint'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isSelected
                    ? 'bg-brand-purple text-white'
                    : 'bg-surface-2 text-muted'
                }`}
              >
                <cat.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink">
                  {cat.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  {cat.description}
                </span>
              </span>
              {isSelected && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-purple text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
