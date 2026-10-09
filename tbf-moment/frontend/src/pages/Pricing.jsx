import { useState } from 'react'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import PricingCard from '../components/pricing/PricingCard'
import BrandBackdrop from '../components/ui/BrandBackdrop'
import { PRICING_PLANS as PLANS } from '../data/pricingPlans'
import { useSeo } from '../utils/seo'

const MODULES = [
  { name: 'Event Builder', values: ['Limité', 'Complet', 'Complet', 'Complet', 'Complet'] },
  { name: 'Billetterie', values: ['–', 'Gratuite', 'Gratuite', 'Payante', 'Payante'] },
  { name: 'Check-in QR', values: ['–', '1 poste', '3 postes', 'Illimité', 'Illimité'] },
  { name: 'Analytics', values: ['Basique', 'Standard', 'Standard', 'Avancé', 'Avancé + API'] },
]

const HIGHLIGHT_VALUES = new Set(['Payante', 'Illimité'])

export default function Pricing() {
  useSeo({
    title: 'Tarifs',
    description:
      "Gratuit pour commencer, Premium pour aller plus loin : comparez les offres TBF Moment pour créer le site de votre événement.",
    path: '/tarifs',
  })
  const [period, setPeriod] = useState('Mensuel')

  return (
    <div className="flex min-h-svh flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-surface p-10">
          <BrandBackdrop />
          <h1 className="relative text-center text-3xl font-bold text-ink lg:text-4xl">
            Un plan par usage, pas par événement
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted">
            Un compte porte tous vos événements. Les modules avancés se
            débloquent selon le plan.
          </p>

          <div className="mx-auto mt-6 flex w-fit gap-1 rounded-full bg-surface-2 p-1">
            {['Mensuel', 'Annuel'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition ${
                  period === p ? 'bg-brand-indigo text-white' : 'text-muted'
                }`}
              >
                {p}
                {p === 'Annuel' && (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-5">
            {PLANS.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold text-ink">Comparatif des modules</h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-border-soft bg-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-soft text-xs tracking-wider text-faint uppercase">
                  <th className="px-6 py-3 font-medium">Module</th>
                  {PLANS.map((plan) => (
                    <th key={plan.name} className="px-4 py-3 font-medium">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((module) => (
                  <tr key={module.name} className="border-b border-border-soft last:border-b-0">
                    <td className="px-6 py-4 font-medium text-ink">{module.name}</td>
                    {module.values.map((value, i) => (
                      <td
                        key={PLANS[i].name}
                        className={`px-4 py-4 ${
                          HIGHLIGHT_VALUES.has(value) ? 'text-success' : 'text-muted'
                        }`}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
