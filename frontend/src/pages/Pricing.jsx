import { Check } from 'lucide-react'
import { Fragment, useState } from 'react'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import PricingCard from '../components/pricing/PricingCard'
import { PRICING_FAQ } from '../data/pricingFaq'
import { PRICING_PLANS as PLANS } from '../data/pricingPlans'
import { routeSeo } from '../data/seoRoutes'
import { siteUrl, useSeo } from '../utils/seo'

// Conseil affiché sous les boutons : l'offre recommandée et pourquoi. Les chiffres doivent
// rester ceux du tableau comparatif ci-dessous.
const AUDIENCES = [
  { id: 'mariage', label: 'Mariage ou dot', plan: 'Premium', badge: 'Le plus choisi pour les fêtes',
    why: 'Premium couvre 500 invités, le plan de table, les pass QR et le scanner. Payez un mois, arrêtez après la fête.' },
  { id: 'anniversaire', label: 'Petit anniversaire', plan: 'Free', badge: 'Suffisant pour commencer',
    why: 'Free suffit pour 50 invités : page, réponses et relances WhatsApp. Passez à Premium pour les modèles premium, la musique et les animations.' },
  { id: 'hommage', label: 'Obsèques ou retrait de deuil', plan: 'Premium', badge: 'Le plus choisi pour les familles',
    why: 'Premium permet de partager le programme, les lieux et les contributions avec la famille élargie, jusqu’à 500 personnes.' },
  { id: 'ecole', label: 'École ou université', plan: 'Business', badge: 'Écoles et entreprises',
    why: 'Business ajoute le logo de l’établissement, retire la mention TBF Moment et ouvre la billetterie pour la journée culturelle.' },
  { id: 'entreprise', label: 'Entreprise ou association', plan: 'Business', badge: 'Écoles et entreprises',
    why: 'Business : votre logo, 5 postes d’accueil, la billetterie et une facture au nom de la structure.' },
  { id: 'concert', label: 'Concert ou soirée payante', plan: 'Business', badge: 'Billetterie Mobile Money',
    why: 'Business ouvre la billetterie Mobile Money (5 % de commission). Si vous organisez souvent, Event Pro baisse la commission à 3 %.' },
  { id: 'agence', label: 'Agence ou salle de fêtes', plan: 'Event Pro', badge: 'Pour les organisateurs',
    why: 'Event Pro : événements et invités illimités, 5 000 photos, rappels automatiques par e-mail et billetterie à 3 %.' },
  { id: 'institution', label: 'Institution ou grand groupe', plan: 'Enterprise', badge: 'Sur mesure',
    why: 'Enterprise : modèle créé sur mesure, capacité adaptée, commission négociée et un interlocuteur dédié.' },
]

const PAYMENT_METHODS = [
  { label: 'Orange Money', color: 'bg-[#ff7900]' },
  { label: 'MTN MoMo', color: 'bg-[#ffcb05]' },
  { label: 'Paiement Mobile Money', color: 'bg-brand-purple' },
  { label: 'Paiement sécurisé', color: 'bg-success' },
]

const COMPARISON_SECTIONS = [
  {
    name: 'Capacité',
    rows: [
      { name: 'Événements en ligne en même temps', values: ['1', '3', 'Illimité', 'Illimité', 'Sur mesure'] },
      { name: 'Invités ou billets par événement', values: ['50', '500', '2 000', 'Illimité', 'Sur mesure'] },
      { name: 'Photos dans la galerie', values: ['20', '200', '1 000', '5 000', 'Illimité'] },
      // Pas encore disponibles : affichés comme tels, jamais vendus comme acquis.
      { name: 'Co-organisateurs (bientôt)', values: ['1', '2', '5', '15', 'Illimité'] },
      { name: 'Postes d’accueil (scanner)', values: ['—', '1', '5', 'Illimité', 'Illimité'] },
      { name: 'Commission billetterie (hors frais KPay)', values: ['—', '—', '5 %', '3 %', 'Négociée'] },
    ],
  },
  {
    name: 'Invitation',
    rows: [
      { name: 'Page d’événement et réponses (RSVP)', values: [true, true, true, true, true] },
      { name: 'Aperçu soigné dans WhatsApp', values: [true, true, true, true, true] },
      { name: 'Modèles premium (27 et plus)', values: ['—', true, true, true, true] },
      { name: 'Ouvertures animées, musique et particules', values: ['Ouverture simple', true, true, true, true] },
    ],
  },
  {
    name: 'Invités',
    rows: [
      { name: 'Liens personnels par invité', values: ['—', true, true, true, true] },
      { name: 'Relances WhatsApp en un geste', values: [true, true, true, true, true] },
      { name: 'Rappels automatiques par e-mail (J-7, veille, remerciements)', values: ['—', '—', '—', true, true] },
      { name: 'Export Excel de la liste', values: ['—', true, true, true, true] },
    ],
  },
  {
    name: 'Jour J',
    rows: [
      { name: 'Plan de table et « Trouver ma place »', values: ['—', true, true, true, true] },
      { name: 'Pass d’entrée QR et scanner', values: ['—', true, true, true, true] },
      { name: 'Billetterie Mobile Money', values: ['—', '—', true, true, true] },
    ],
  },
  {
    name: 'Image',
    rows: [
      { name: 'Logo de l’organisateur', values: ['—', '—', true, true, true] },
      { name: 'Sans la mention « Créé avec TBF MOMENT »', values: ['—', '—', true, true, true] },
      { name: 'Adresse personnalisée (bientôt)', values: ['—', '—', '—', true, true] },
      { name: 'Modèle créé sur mesure à vos couleurs', values: ['—', '—', '—', '—', true] },
    ],
  },
  {
    name: 'Services',
    rows: [
      { name: 'API et intégrations (bientôt)', values: ['—', '—', '—', '—', true] },
      { name: 'Facture au nom de la structure', values: ['—', '—', true, true, true] },
    ],
  },
  {
    name: 'Assistance',
    rows: [
      { name: 'Assistance', values: ['E-mail', 'WhatsApp', 'WhatsApp prioritaire', 'Ligne directe le jour J', 'Interlocuteur dédié'] },
    ],
  },
]

function ComparisonValue({ value }) {
  if (value === true) {
    return <Check aria-label="Inclus" className="mx-auto h-4 w-4 text-success" />
  }

  return <span className={value === '—' ? 'text-faint' : 'text-ink'}>{value}</span>
}

export default function Pricing() {
  useSeo(routeSeo('/tarifs', siteUrl()))
  const [audience, setAudience] = useState(AUDIENCES[0].id)
  const selectedAudience = AUDIENCES.find((item) => item.id === audience)
  const plans = PLANS.filter((plan) => !plan.enterprise).map((plan) => ({
    ...plan,
    recommended: plan.name === selectedAudience.plan,
    recommendationLabel: plan.name === selectedAudience.plan ? selectedAudience.badge : undefined,
  }))
  const enterpriseRecommended = selectedAudience.plan === 'Enterprise'

  return (
    <div className="flex min-h-svh flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-brand-purple uppercase">
            Tarifs
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Un prix clair, <span className="bg-brand-gradient bg-clip-text text-transparent">en francs CFA.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Sans engagement : payez un mois, arrêtez quand vous voulez. Vos invités,
            eux, n’ont jamais rien à payer pour répondre.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method.label}
                className="inline-flex items-center gap-2 rounded-full border border-border-soft px-3 py-1.5 text-xs font-medium text-muted"
              >
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${method.color}`} />
                {method.label}
              </span>
            ))}
          </div>
        </header>

        <section className="mt-8" aria-labelledby="audience-heading">
          <h2 id="audience-heading" className="text-center text-[11px] font-semibold tracking-[0.18em] text-faint uppercase">
            Quel est votre événement ?
          </h2>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {AUDIENCES.map((item) => {
              const isSelected = item.id === audience
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setAudience(item.id)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    isSelected
                      ? 'border-brand-purple bg-brand-purple/20 text-ink'
                      : 'border-border-soft bg-surface/70 text-muted hover:border-brand-purple/60 hover:text-ink'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted" aria-live="polite">
            <b className="text-ink">Notre conseil : {selectedAudience.plan}.</b> {selectedAudience.why}
          </p>
        </section>

        <section className="mt-10 grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Nos offres">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} variant="pricing" />
          ))}
        </section>

        <section
          className={`relative mt-6 grid gap-6 rounded-2xl border bg-surface p-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:items-center sm:p-8 ${
            enterpriseRecommended ? 'border-brand-purple ring-2 ring-brand-purple/40' : 'border-brand-purple/40'
          }`}
          aria-labelledby="enterprise-heading"
        >
          {enterpriseRecommended && (
            <span className="absolute -top-3 left-6 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white">
              {selectedAudience.badge}
            </span>
          )}
          <div>
            <h2 id="enterprise-heading" className="text-lg font-bold text-ink">
              Enterprise
            </h2>
            <p className="mt-2 text-sm text-muted">
              Grands groupes, institutions, événements à plusieurs sites
            </p>
            <p className="mt-5 border-b border-border-soft pb-2 text-2xl font-bold text-ink">
              Sur devis
            </p>
            <p className="mt-3 text-xs font-medium tracking-widest text-faint uppercase">
              Idéal pour
            </p>
            <p className="mt-1 text-sm text-ink">
              Institution, grand groupe, festival
            </p>
          </div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <ul className="space-y-2 text-sm text-ink">
              {[
                'Événements et invités sans limite',
                'Modèle créé sur mesure à vos couleurs',
                'Facture au nom de la structure',
                'Commission billetterie négociée',
                'Interlocuteur dédié',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href="mailto:contact@tbfmoment.com?subject=Offre%20Enterprise"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-brand-purple/40 px-5 text-sm font-semibold text-ink transition hover:border-brand-purple hover:bg-brand-purple/10"
            >
              Nous contacter
            </a>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="text-2xl font-bold text-ink">
            Tout comparer
          </h2>
          <p className="mt-2 text-sm text-muted">
            Les limites s’appliquent à chaque événement. Vous pouvez changer d’offre à tout moment.
          </p>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-border-soft bg-surface">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-surface-2">
                  <th scope="col" className="sticky left-0 z-10 min-w-64 bg-surface-2 px-4 py-4">
                    Offre
                  </th>
                  {PLANS.map((plan) => {
                    const isRecommended = plan.name === selectedAudience.plan
                    return (
                      <th
                        key={plan.name}
                        scope="col"
                        className={`min-w-36 px-4 py-4 text-center ${isRecommended ? 'bg-brand-purple/20' : ''}`}
                      >
                        <span className="block font-bold text-ink">{plan.name}</span>
                        <span className="mt-1 block text-xs font-normal text-muted">
                          {plan.price === '0 FCFA' ? 'Gratuit' : plan.period ? `${plan.price} FCFA ${plan.period}` : plan.price}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_SECTIONS.map((section) => (
                  <Fragment key={section.name}>
                    <tr className="border-t border-border-soft bg-surface-2/70">
                      <th
                        scope="colgroup"
                        colSpan={PLANS.length + 1}
                        className="px-4 pt-5 pb-2 text-xs font-bold tracking-widest text-[color:var(--color-gold)] uppercase"
                      >
                        {section.name}
                      </th>
                    </tr>
                    {section.rows.map((row) => (
                      <tr key={row.name} className="border-t border-border-soft">
                        <th scope="row" className="sticky left-0 z-10 bg-surface px-4 py-3 text-left font-medium text-ink">
                          {row.name}
                        </th>
                        {row.values.map((value, index) => (
                          <td
                            key={PLANS[index].name}
                            className={`px-4 py-3 text-center ${PLANS[index].name === selectedAudience.plan ? 'bg-brand-purple/10' : ''}`}
                          >
                            <ComparisonValue value={value} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="pricing-faq-heading">
          <h2 id="pricing-faq-heading" className="text-2xl font-bold text-ink">
            Questions fréquentes
          </h2>
          <p className="mt-2 text-sm text-muted">
            Une autre question ? Écrivez-nous sur{' '}
            <a href="https://wa.me/237680264060" target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline">
              WhatsApp au +237 680 26 40 60
            </a>
            .
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {PRICING_FAQ.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-border-soft bg-surface px-5 open:border-brand-purple/50">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span aria-hidden="true" className="font-mono text-muted group-open:hidden">+</span>
                  <span aria-hidden="true" className="hidden font-mono text-muted group-open:inline">−</span>
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
