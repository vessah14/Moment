import { iconForCategory } from '../../utils/categoryIcon'

export default function CategoryStep({ categories, loading, selectedId, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">
        Quel type d'événement souhaitez-vous créer ?
      </h2>
      <p className="mt-2 text-sm text-muted">
        Sélectionnez la catégorie qui correspond le mieux à votre projet pour
        charger les configurations adaptées.
      </p>

      {loading && (
        <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
          Chargement des catégories…
        </p>
      )}

      {!loading && categories.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
          Aucune catégorie d'événement n'est configurée côté serveur. Contactez
          un administrateur.
        </p>
      )}

      {!loading && categories.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => {
            const isSelected = cat.id === selectedId
            const Icon = iconForCategory(cat.label)
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelect(cat)}
                title={cat.description || undefined}
                className={`flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition ${
                  isSelected
                    ? 'border-brand-purple bg-brand-purple/10'
                    : 'border-border-soft bg-surface hover:border-faint'
                }`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                    isSelected
                      ? 'bg-brand-purple text-white'
                      : 'bg-surface-2 text-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
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
      )}
    </div>
  )
}
