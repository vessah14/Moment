const WIZARD_STEPS = ['Catégorie', 'Informations', 'Modèle', 'Publication']

export default function StepProgress({ currentStep }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {WIZARD_STEPS.map((step, index) => {
        const isDone = index < currentStep
        const isCurrent = index === currentStep
        return (
          <div key={step}>
            <div
              className={`h-1 rounded-full ${
                isDone
                  ? 'bg-[linear-gradient(92deg,_var(--color-brand-orange),_var(--color-brand-pink))]'
                  : isCurrent
                    ? 'bg-[linear-gradient(92deg,_var(--color-brand-purple),_var(--color-brand-indigo))]'
                    : 'bg-border-soft'
              }`}
            />
            <p
              className={`mt-2 truncate text-[11px] font-medium sm:text-xs ${
                isCurrent ? 'text-ink' : isDone ? 'text-muted' : 'text-faint'
              }`}
            >
              {step}
            </p>
          </div>
        )
      })}
    </div>
  )
}
