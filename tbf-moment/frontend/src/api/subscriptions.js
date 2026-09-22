import { apiFetch } from './client'

export function listSubscriptionPlans() {
  return apiFetch('/subscription-plans')
}

export function listMySubscriptions() {
  return apiFetch('/user-subscriptions/me')
}

export function subscribeToPlan(planId) {
  return apiFetch(`/user-subscriptions/subscribe/${planId}`, { method: 'POST', body: { planId } })
}

export function cancelSubscription(id, reason) {
  return apiFetch(`/user-subscriptions/${id}/cancel`, { method: 'PUT', body: { reason } })
}
