import { useState } from 'react'
import { Link } from 'react-router-dom'
import { isAuthenticated } from '../../api/client'
import { usePlan } from '../../utils/usePlan'
import UpgradeDialog from '../plan/UpgradeDialog'

// Bouton d'une offre de la page Tarifs. Visiteur : inscription. Client connecté : offre
// gratuite -> tableau de bord ; offre payante -> demande de passage à cette offre.
const PLAN_CODES = { Premium: 'premium', Business: 'business', 'Event Pro': 'eventpro' }

function UpgradeCta({ plan, className }) {
  const { plan: current } = usePlan()
  const [open, setOpen] = useState(false)
  const code = PLAN_CODES[plan.name]
  const isCurrent = current?.planCode === code
  return (
    <>
      <button type="button" disabled={isCurrent} onClick={() => setOpen(true)} className={`${className} w-full disabled:cursor-default disabled:opacity-60`}>
        {isCurrent ? 'Votre offre actuelle' : plan.cta}
      </button>
      <UpgradeDialog open={open} onClose={() => setOpen(false)} plan={current} initialPlanCode={code} />
    </>
  )
}

export default function PlanCta({ plan, className }) {
  if (!isAuthenticated())
    return (
      <Link to="/inscription" className={className}>
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
