import { clearToken, getToken } from '../api/client'
import { logout } from '../api/auth'

// Décode le payload d'un JWT sans vérifier sa signature (la signature est de
// toute façon revalidée par le backend à chaque appel) — sert uniquement à lire
// la date d'expiration côté client pour éviter d'afficher une session "connectée"
// alors que le jeton a expiré, ce qui peut arriver longtemps avant le premier
// appel API si une page ne fait aucune requête au montage.
function isTokenExpired(token) {
  try {
    const encoded = token.split('.')[1]
    if (!encoded) return true

    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(padded), character => character.charCodeAt(0))
    const payload = JSON.parse(new TextDecoder().decode(bytes))
    if (!payload.exp) return false
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

export function isAdminAuthenticated() {
  const token = getToken()
  if (!token) return false
  if (isTokenExpired(token)) {
    clearToken()
    return false
  }
  return true
}

export function clearAdminAuthenticated() {
  logout()
}
