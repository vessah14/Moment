import { apiFetch, clearCurrentAdmin, clearToken, setCurrentAdmin, setToken, getToken } from './client'

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
