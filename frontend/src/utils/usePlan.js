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

export function eventUsagePercent(plan) {
  if (!plan || plan.maxEvents == null) return null
  return Math.min(100, Math.round((Math.max(0, plan.eventsUsed) / Math.max(1, plan.maxEvents)) * 100))
}

export function usePlan() {
  const [state, setState] = useState({ plan: null, loading: true, error: '' })

  useEffect(() => {
    let cancelled = false
    let loading = false
    let retryTimer
    const load = async () => {
      if (cancelled || loading) return
      loading = true
      try {
        const plan = await getMyPlan()
        if (!plan) throw new Error('La réponse du serveur ne contient pas le plan.')
        if (!cancelled) setState({ plan, loading: false, error: '' })
      } catch {
        if (cancelled) return
        setState((current) => ({
          ...current,
          loading: false,
          error: current.plan ? '' : "Impossible de charger l'offre. Nouvelle tentative automatique…",
        }))
        retryTimer = window.setTimeout(refresh, 15000)
      } finally {
        loading = false
      }
    }
    const refresh = () => {
      window.clearTimeout(retryTimer)
      setState((current) => current.plan ? current : { plan: null, loading: true, error: '' })
      load()
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    refresh()
    window.addEventListener(PLAN_CHANGED_EVENT, refresh)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      cancelled = true
      window.clearTimeout(retryTimer)
      window.removeEventListener(PLAN_CHANGED_EVENT, refresh)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return {
    ...state,
    retry: () => window.dispatchEvent(new Event(PLAN_CHANGED_EVENT)),
  }
}
