import { EVENT_CATEGORIES } from '../../data/eventCategories'

export default function CategoryStep({ selected, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">
        Quel type d'événement organisez-vous ?
      </h2>
      <p className="mt-2 text-sm text-muted">
        Ce choix personnalise les modules suggérés et les modèles proposés à
        l'étape suivante.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {EVENT_CATEGORIES.map((cat) => {
          const isSelected = cat.label === selected
          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => onSelect(cat.label)}
              className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition ${
                isSelected
                  ? 'border-brand-purple bg-brand-purple/10'
                  : 'border-border-soft bg-surface hover:border-faint'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  isSelected
                    ? 'bg-brand-purple text-white'
                    : 'bg-surface-2 text-muted'
                }`}
              >
                <cat.icon className="h-4 w-4" />
              </span>
              <span
                className={`text-sm font-medium ${isSelected ? 'text-ink' : 'text-muted'}`}
              >
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
