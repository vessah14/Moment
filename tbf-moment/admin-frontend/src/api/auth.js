import { apiFetch, clearCurrentAdmin, clearToken, setCurrentAdmin, setToken } from './client'

export async function login({ email, password }) {
  const result = await apiFetch('/admin/accounts/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })
  setToken(result.token)
  setCurrentAdmin(result.utilisateur)
  return result
}

export function logout() {
  clearToken()
  clearCurrentAdmin()
}
