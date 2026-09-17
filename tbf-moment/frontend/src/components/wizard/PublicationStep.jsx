import { Check } from 'lucide-react'

const VISIBILITY_OPTIONS = [
  {
    value: 'publish',
    title: 'Publier maintenant',
    description: 'Le site est en ligne immédiatement, à votre URL publique.',
  },
  {
    value: 'draft',
    title: 'Enregistrer comme brouillon',
    description: 'Continuez à le modifier avant de le rendre visible.',
  },
]

export default function PublicationStep({ event, visibility, onChangeVisibility }) {
  const recap = [
    { label: 'Catégorie', value: event.category },
    { label: 'Informations', value: event.name },
    { label: 'Lieux', value: `${event.locations?.length ?? 0} lieu(x)` },
    { label: 'Modèle', value: event.template ?? 'Non choisi' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">Prêt à publier</h2>
      <p className="mt-2 text-sm text-muted">
        Vérifiez les informations avant de mettre votre événement en ligne.
      </p>

      <div className="mt-6 space-y-2">
        {recap.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-lg border border-border-soft bg-surface px-4 py-3"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm text-faint">{item.label}</span>
            <span className="ml-auto text-sm font-medium text-ink">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <span className="text-sm font-medium text-ink">Visibilité</span>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {VISIBILITY_OPTIONS.map((option) => {
            const isSelected = visibility === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChangeVisibility(option.value)}
                className={`rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? 'border-brand-purple bg-brand-purple/10'
                    : 'border-border-soft bg-surface hover:border-faint'
                }`}
              >
                <p className="text-sm font-semibold text-ink">{option.title}</p>
                <p className="mt-1 text-xs text-faint">{option.description}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
