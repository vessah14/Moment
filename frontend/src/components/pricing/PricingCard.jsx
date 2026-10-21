import { Check } from 'lucide-react'
import PlanCta from './PlanCta'

export default function PricingCard({ plan, variant = 'default' }) {
  const pricingVariant = variant === 'pricing'
  const ctaClassName = `mt-6 block rounded-full px-6 py-3 text-center text-sm font-semibold transition ${
    pricingVariant
      ? plan.recommended
        ? 'bg-brand-purple text-white hover:bg-brand-indigo'
        : 'border border-border-soft bg-transparent text-ink hover:border-brand-purple hover:bg-brand-purple/10'
      : plan.recommended
        ? 'bg-brand-gradient text-white hover:opacity-90'
      : plan.enterprise
        ? 'bg-[color:var(--color-gold)] text-bg'
        : 'bg-brand-indigo text-white hover:bg-brand-purple'
  }`

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        plan.enterprise
          ? 'border-[color:var(--color-gold)]/30 bg-[linear-gradient(160deg,_var(--color-surface),_var(--color-panel))]'
          : plan.recommended
            ? pricingVariant
              ? 'border-brand-purple bg-[linear-gradient(155deg,_rgba(86,54,214,0.28),_var(--color-surface)_58%)]'
              : 'border-brand-purple bg-surface'
            : 'border-border-soft bg-surface'
      }`}
    >
      {plan.recommended && (
        <span className={`bg-brand-gradient absolute -top-3 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide text-white ${
          pricingVariant ? 'left-4' : 'left-1/2 -translate-x-1/2'
        }`}>
          {plan.recommendationLabel ?? 'Recommandé'}
        </span>
      )}

      <p
        className={`font-semibold ${plan.enterprise ? 'text-[color:var(--color-gold)]' : 'text-ink'}`}
      >
        {plan.name}
      </p>

      <p
        className={`mt-3 ${pricingVariant ? 'text-4xl' : 'text-3xl'} font-bold ${plan.enterprise ? 'text-[color:var(--color-gold)]' : 'text-ink'}`}
      >
        {plan.price}
        {plan.period && (
          <span className="ml-1 text-sm font-normal text-faint">
            {plan.period}
          </span>
        )}
      </p>
      <p className="mt-2 text-sm text-muted">{plan.tagline}</p>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-muted">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" />
            {feature}
          </li>
        ))}
      </ul>

      {plan.enterprise ? (
        <a href="mailto:contact@tbfmoment.com?subject=Offre%20Enterprise" className={ctaClassName}>
          {plan.cta}
        </a>
      ) : (
        <PlanCta plan={plan} className={ctaClassName} />
      )}
    </div>
  )
}
