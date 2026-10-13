import { apiFetch, clearCurrentAdmin, clearToken, setCurrentAdmin, setToken, getToken } from './client'

// Étape 1 : mot de passe. Ne donne jamais accès à la console à lui seul : le serveur
// renvoie l'étape de double authentification (mfaToken, et le QR code au premier passage).
export async function login({ email, password }) {
  return apiFetch('/admin/accounts/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })
}

// Étape 2 : code à 6 chiffres de l'application d'authentification.
export async function verifyMfa({ mfaToken, code }) {
  const result = await apiFetch('/admin/accounts/login/mfa', {
    method: 'POST',
    auth: false,
    body: { mfaToken, code },
  })
  setToken(result.token)
  setCurrentAdmin(result.utilisateur)
  return result
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
  clearCurrentAdmin()
}
