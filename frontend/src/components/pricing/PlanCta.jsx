import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { isAuthenticated } from '../../api/client'
import { usePlan } from '../../utils/usePlan'
import UpgradeDialog from '../plan/UpgradeDialog'

// Bouton d'une offre de la page Tarifs. Visiteur : inscription. Client connecté : offre
// gratuite -> tableau de bord ; offre payante -> paiement de cette offre. Au retour de
// l'inscription (/tarifs?offre=premium), la fenêtre de paiement s'ouvre d'elle-même.
const PLAN_CODES = { Premium: 'premium', Business: 'business', 'Event Pro': 'eventpro' }

function UpgradeCta({ plan, className }) {
  const { plan: current } = usePlan()
  const [searchParams] = useSearchParams()
  const code = PLAN_CODES[plan.name]
  const [open, setOpen] = useState(() => searchParams.get('offre') === code)
  const isCurrent = current?.planCode === code
  return (
    <>
      <button type="button" disabled={isCurrent} onClick={() => setOpen(true)} className={`${className} w-full disabled:cursor-default disabled:opacity-60`}>
        {isCurrent ? 'Votre offre actuelle' : plan.cta}
      </button>
      <UpgradeDialog open={open && !isCurrent} onClose={() => setOpen(false)} plan={current} initialPlanCode={code} />
    </>
  )
}

export default function PlanCta({ plan, className }) {
  if (!isAuthenticated())
    return (
      <Link
        to={`/inscription?${new URLSearchParams({
          offre: PLAN_CODES[plan.name] ?? 'free',
          retour: `/tarifs?offre=${encodeURIComponent(PLAN_CODES[plan.name] ?? 'free')}`,
        })}`}
        className={className}
      >
        {plan.cta}
      </Link>
    )
  if (!PLAN_CODES[plan.name])
    return (
      <Link to="/dashboard" className={className}>
        Mon tableau de bord
      </Link>
    )
  return <UpgradeCta plan={plan} className={className} />
}
