export default function OnboardingProgress({ currentStep, total = 4 }) {
  const percent = ((currentStep + 1) / total) * 100

  return (
    <div className="mx-auto w-full max-w-xs text-center">
      <p className="text-xs font-semibold tracking-widest text-brand-purple uppercase">
        Étape {currentStep + 1} sur {total}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border-soft">
        <div
          className="h-full rounded-full bg-[linear-gradient(92deg,_var(--color-brand-orange),_var(--color-brand-pink))] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
