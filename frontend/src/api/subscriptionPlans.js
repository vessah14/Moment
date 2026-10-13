import { apiFetch } from './client'

export function listSubscriptionPlans() {
  return apiFetch('/subscription-plans')
}
