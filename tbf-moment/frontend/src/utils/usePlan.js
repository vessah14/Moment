import { useEffect, useState } from 'react'
import { getMyPlan } from '../api/account'

// Offre de l'organisateur connecté (lue en base) : partagée par la barre latérale,
// l'assistant de création et la fenêtre « Passer à une offre supérieure ». Après une
// demande ou un nouvel événement, notifyPlanChanged() la fait relire partout.
export const PLAN_CHANGED_EVENT = 'tbf:plan-changed'

export function notifyPlanChanged() {
  window.dispatchEvent(new Event(PLAN_CHANGED_EVENT))
}

// Limite atteinte (null = illimité).
export function isEventLimitReached(plan) {
  return Boolean(plan && plan.maxEvents != null && plan.eventsUsed >= plan.maxEvents)
}

export function usePlan() {
  const [plan, setPlan] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = () =>
      getMyPlan()
        .then((data) => {
          if (!cancelled) setPlan(data)
        })
        .catch(() => {
          if (!cancelled) setPlan(null)
        })
    load()
    window.addEventListener(PLAN_CHANGED_EVENT, load)
    return () => {
      cancelled = true
      window.removeEventListener(PLAN_CHANGED_EVENT, load)
    }
  }, [])

  return plan
}
