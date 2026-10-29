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

export function createSasPayCheckout(planId, idempotencyKey) {
  return apiFetch('/payments/saspay/checkout', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: { planId }
  })
}

export function getSasPayPaymentStatus(paymentId) {
  return apiFetch(`/payments/saspay/${paymentId}`)
}

export function cancelSubscription(id, reason) {
  return apiFetch(`/user-subscriptions/${id}/cancel`, { method: 'PUT', body: { reason } })
}
