export default function StepProgress({ currentStep, totalSteps, stepLabel }) {
  const percent = Math.round(((currentStep + 1) / totalSteps) * 100)

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-xs font-medium">
        <span className="text-brand-purple">
          Étape {currentStep + 1} sur {totalSteps}
          <span className="text-faint"> · </span>
          <span className="text-ink">{stepLabel}</span>
        </span>
        <span className="shrink-0 text-faint">{percent}% Complété</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border-soft">
        <div
          className="h-full rounded-full bg-[linear-gradient(92deg,_var(--color-brand-orange),_var(--color-brand-pink))] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
