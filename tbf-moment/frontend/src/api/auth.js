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

export async function loginWithGoogle(idToken) {
  const result = await apiFetch('/users/oauth/google', {
    method: 'POST',
    auth: false,
    body: { idToken },
  })
  setToken(result.token)
  setCurrentUser(result.utilisateur)
  return result
}

export async function loginWithFacebook(accessToken) {
  const result = await apiFetch('/users/oauth/facebook', {
    method: 'POST',
    auth: false,
    body: { accessToken },
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

export async function requestPasswordReset(email) {
  await apiFetch('/users/forgot-password', {
    method: 'POST',
    auth: false,
    body: { email },
  })
}

export async function resetPassword({ token, newPassword, confirmPassword }) {
  await apiFetch('/users/reset-password', {
    method: 'POST',
    auth: false,
    body: { token, newPassword, confirmPassword },
  })
}
