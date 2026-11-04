import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatFcfa, invitationCost } from '../../utils/invitationCost'
import SectionHeader from './SectionHeader'
import { t } from '../../i18n'

// « Combien coûtent vos invitations ? » : l'organisateur met son nombre d'invités et le
// prix réel d'un carton, et voit ce que coûte l'offre TBF MOMENT qui lui suffit.
export default function CostCalculator() {
  const [guests, setGuests] = useState(200)
  const [cardPrice, setCardPrice] = useState('500')
  const ids = useId()
  const { paper, plan, saving } = invitationCost(guests, cardPrice)

  return (
    <section id="economies" aria-labelledby={`${ids}-t`} className="relative">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <SectionHeader id={`${ids}-t`} eyebrow={t("Faites le calcul")} title={t("Combien coûtent vos invitations ?")}>
          {t("Comparez avec des cartons imprimés, en mettant vos propres prix.")}
        </SectionHeader>

        <div className="mt-10 grid gap-6 rounded-3xl border border-border-soft bg-surface p-6 shadow-sm md:grid-cols-2 md:p-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={`${ids}-n`} className="text-sm font-medium text-ink">
                  {t("Nombre d'invités")}
                </label>
                <output htmlFor={`${ids}-n`} className="text-2xl font-bold text-ink tabular-nums">
                  {guests}
                </output>
              </div>
              <input
                id={`${ids}-n`}
                type="range"
                min={20}
                max={1000}
                step={10}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="mt-3 w-full accent-brand-purple"
              />
            </div>
            <div>
              <label htmlFor={`${ids}-p`} className="text-sm font-medium text-ink">
                {t("Prix d'un carton imprimé")}
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id={`${ids}-p`}
                  type="number"
                  min={0}
                  max={20000}
                  step={50}
                  inputMode="numeric"
                  value={cardPrice}
                  onChange={(e) => setCardPrice(e.target.value)}
                  aria-describedby={`${ids}-ph`}
                  className="w-36 rounded-lg border border-border-soft bg-bg px-3 py-2 text-lg font-semibold text-ink tabular-nums"
                />
                <span className="text-sm text-muted">FCFA</span>
              </div>
              <p id={`${ids}-ph`} className="mt-2 text-xs text-muted">
                {t("Pensez à l'enveloppe, au nom de l'invité et à la livraison. Mettez votre prix réel.")}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-2xl bg-surface-2 p-5" aria-live="polite">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t("Cartons imprimés")}</dt>
                <dd className="whitespace-nowrap font-semibold text-ink tabular-nums">{formatFcfa(paper)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">
                  TBF MOMENT · <span className="font-semibold text-brand-purple">{plan.name}</span>
                  <span className="mt-1 block text-xs text-faint">
                    {plan.price ? t('{price} pour 30 jours, sans renouvellement automatique.', { price: formatFcfa(plan.price) }) : t('Gratuit, sans limite de durée.')}
                  </span>
                </dt>
                <dd className="whitespace-nowrap font-semibold text-ink tabular-nums">{formatFcfa(plan.price)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-border-soft pt-3 text-base">
                <dt className="font-semibold text-ink">{t("Vous économisez")}</dt>
                <dd className="whitespace-nowrap font-bold text-brand-purple tabular-nums">{formatFcfa(saving)}</dd>
              </div>
            </dl>
            <p className="text-xs text-muted">
              {t('Réponses, relances WhatsApp, plan de table et pass QR compris. Vous voulez quand même quelques cartons pour les aînés ?')}{' '}
              <a href="#souvenirs" className="font-semibold text-brand-purple hover:underline">
                {t("TBF DIGITAL les imprime")}
              </a>{' '}
              {t('avec le QR code de chaque invité.')}
            </p>
            <Link to="/inscription" className="self-start rounded-lg bg-brand-purple px-4 py-2 text-sm font-semibold text-white">
              {t("Créer ma page")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
