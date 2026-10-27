import { apiFetch, setCurrentUser } from './client'

export async function updateProfile(id, dto) {
  const result = await apiFetch(`/users/${id}`, { method: 'PUT', body: dto })
  setCurrentUser(result)
  return result
}

// Relit le compte connecté (ex. adresse confirmée depuis un autre appareil).
export async function refreshCurrentUser(id) {
  const result = await apiFetch(`/users/${id}`)
  setCurrentUser(result)
  return result
}

export function changePassword(id, dto) {
  return apiFetch(`/users/${id}/change-password`, { method: 'POST', body: dto })
}

export function deactivateAccount(id) {
  return apiFetch(`/users/${id}/deactivate`, { method: 'PATCH' })
}

export function verifyEmail(token) {
  return apiFetch('/users/verify-email', { method: 'POST', body: { token }, auth: false })
}

export function resendVerificationEmail() {
  return apiFetch('/users/me/resend-verification', { method: 'POST' })
}

export function getNotificationSettings() {
  return apiFetch('/users/me/notification-settings')
}

export function updateNotificationSettings(dto) {
  return apiFetch('/users/me/notification-settings', { method: 'PUT', body: dto })
}
