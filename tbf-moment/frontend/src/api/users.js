import { apiFetch, setCurrentUser } from './client'

export async function updateProfile(id, dto) {
  const result = await apiFetch(`/users/${id}`, { method: 'PUT', body: dto })
  setCurrentUser(result)
  return result
}

export function changePassword(id, dto) {
  return apiFetch(`/users/${id}/change-password`, { method: 'POST', body: dto })
}

export function deactivateAccount(id) {
  return apiFetch(`/users/${id}/deactivate`, { method: 'PATCH' })
}
