import { apiFetch, clearCurrentUser, clearToken, setCurrentUser, setToken, getToken } from './client'

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

// Jeton d'accès Google (fenêtre OAuth ouverte par le bouton du site).
export async function loginWithGoogle(accessToken) {
  const result = await apiFetch('/users/oauth/google', {
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

// Déconnexion : le serveur révoque la session tout de suite (le jeton ne peut plus
// servir, même copié). Envoi sans attendre la réponse : la déconnexion locale est immédiate.
export function logout() {
  const token = getToken()
  if (token) {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5146/api'}/session/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      keepalive: true,
    }).catch(() => {})
  }
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

// Renvoi du lien de confirmation sans être connecté : réponse identique que l'adresse
// ait un compte ou non.
export function resendVerificationByEmail(email) {
  return apiFetch('/users/resend-verification', { method: 'POST', auth: false, body: { email } })
}
