import { Link } from 'react-router-dom'
import PricingCard from '../pricing/PricingCard'
import BrandBackdrop from '../ui/BrandBackdrop'
import { PRICING_PLANS } from '../../data/pricingPlans'
import SectionHeader from './SectionHeader'
import { t } from '../../i18n'

const FEATURED = ['Free', 'Premium', 'Business']

export default function PricingTeaser() {
  const plans = PRICING_PLANS.filter((plan) => FEATURED.includes(plan.name))

  return (
    <section id="tarifs" className="relative overflow-hidden">
      <BrandBackdrop side="right" />
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <SectionHeader
          eyebrow={t("Tarifs")}
          title={t("Un plan par usage, pas par événement")}
          action={
            <Link to="/tarifs" className="text-sm font-medium text-brand-purple hover:underline">
              {t("Voir tous les tarifs")}
            </Link>
          }
        >
          {t("Un compte porte tous vos événements. Passez à un plan supérieur seulement si vous en avez besoin.")}
        </SectionHeader>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  )
}
