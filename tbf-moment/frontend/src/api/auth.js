import { apiFetch, clearCurrentUser, clearToken, setCurrentUser, setToken } from './client'

export async function login({ email, password }) {
  const result = await apiFetch('/users/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })
  setToken(result.token)
  setCurrentUser(result.utilisateur)
  return result
}

export async function register({ fullName, email, phone, password, confirmPassword }) {
  return apiFetch('/users/register', {
    method: 'POST',
    auth: false,
    body: {
      fullName,
      email,
      phone: phone || null,
      password,
      confirmPassword,
    },
  })
}

export function logout() {
  clearToken()
  clearCurrentUser()
}
