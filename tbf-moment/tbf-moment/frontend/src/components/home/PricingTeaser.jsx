import { Link } from 'react-router-dom'
import PricingCard from '../pricing/PricingCard'
import BrandBackdrop from '../ui/BrandBackdrop'
import { PRICING_PLANS } from '../../data/pricingPlans'

const FEATURED = ['Free', 'Business', 'Enterprise']

export default function PricingTeaser() {
  const plans = PRICING_PLANS.filter((plan) => FEATURED.includes(plan.name))

  return (
    <section id="tarifs" className="relative overflow-hidden">
      <BrandBackdrop side="right" />
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest text-brand-purple uppercase">
              Tarifs
            </span>
            <h2 className="mt-3 text-3xl font-bold text-ink">
              Un plan par usage, pas par événement
            </h2>
            <p className="mt-2 text-muted">
              Un compte porte tous vos événements. Passez à un plan supérieur
              seulement si vous en avez besoin.
            </p>
          </div>
          <Link
            to="/tarifs"
            className="text-sm font-medium text-brand-purple hover:underline"
          >
            Voir tous les tarifs
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  )
}
