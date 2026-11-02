import { apiFetch } from './client'

export function listAdminAccounts() {
  return apiFetch('/admin/accounts')
}

export function resetAdminMfa(id) {
  return apiFetch(`/admin/accounts/${id}/mfa`, { method: 'DELETE' })
}
