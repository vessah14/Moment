const OBJECTIVES = [
  {
    value: 'Événement privé',
    description:
      'Idéal pour les réunions familiales, fêtes entre amis ou moments intimes.',
  },
  {
    value: 'Événement professionnel',
    description:
      'Conférence, séminaire ou salon d’entreprise avec gestion pointue.',
  },
  {
    value: 'Événement public',
    description:
      'Concert, festival ou spectacle ouvert au grand public avec billetterie.',
  },
  {
    value: 'Je ne sais pas encore',
    description:
      'Permet d’explorer toutes les facettes de TBF Moment sans contrainte.',
  },
]

export default function ObjectiveStep({ selected, onSelect }) {
  return (
    <div>
      <h2 className="text-center text-2xl font-bold text-ink">
        Quel est votre objectif ?
      </h2>
      <p className="mt-2 text-center text-sm text-muted">
        Cela nous permettra d'adapter l'expérience et de vous proposer les
        meilleurs outils.
      </p>

      <div className="mt-8 space-y-3">
        {OBJECTIVES.map((obj) => {
          const isSelected = obj.value === selected
          return (
            <button
              key={obj.value}
              type="button"
              onClick={() => onSelect(obj.value)}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                isSelected
                  ? 'border-brand-purple bg-brand-purple/10'
                  : 'border-border-soft bg-surface hover:border-faint'
              }`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected ? 'border-brand-purple' : 'border-border'
                }`}
              >
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-purple" />
                )}
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">
                  {obj.value}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {obj.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
