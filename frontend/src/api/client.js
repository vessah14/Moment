import { rememberReturnPath } from '../utils/returnPath'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5146/api'
const TOKEN_KEY = 'tbf_auth_token'
const USER_KEY = 'tbf_auth_user'

function decodeTokenPayload(token) {
  const encoded = token.split('.')[1]
  if (!encoded) throw new Error('Jeton invalide')

  // JWT uses base64url, which may contain '-' and '_' and omit padding.
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const bytes = Uint8Array.from(atob(padded), character => character.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

// Origine du backend (sans le suffixe /api), pour construire les URLs de fichiers
// uploadés (galerie) renvoyées en chemins relatifs par l'API.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

// URL d'affichage d'une image téléversée : les chemins « /uploads/… » sont servis par le
// backend ; les images Cloudinary (URL https complètes) sont servies par leur CDN, en
// format et qualité automatiques (WebP/AVIF selon le navigateur, poids réduit).
const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/+$/, '')

// Lien de partage d'un site d'événement (WhatsApp, Facebook…) : l'adresse lisible
// tbfmoment.com/e/... ; le site renvoie les robots d'aperçu vers l'API, qui leur sert le
// vrai titre et l'affiche (frontend/vercel.json).
export function eventShareUrl(slug) {
  return `${SITE_ORIGIN}/e/${encodeURIComponent(slug)}`
}

// Images du kit de partage : 'square' (discussions WhatsApp) ou 'story' (Statut).
export function eventPosterUrl(slug, format) {
  return `${API_ORIGIN}/share/e/${encodeURIComponent(slug)}/poster-${format}.png`
}

export function mediaUrl(path) {
  if (typeof path !== 'string' || !path) return ''
  if (path.startsWith('https://res.cloudinary.com/'))
    return path.replace('/image/upload/', '/image/upload/f_auto,q_auto/')
  return path.startsWith('/') ? `${API_ORIGIN}${path}` : ''
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

// Décode le payload d'un JWT sans vérifier sa signature (revalidée de toute
// façon par le backend à chaque appel) — sert uniquement à détecter côté
// client un jeton déjà expiré, sans attendre le premier 401.
function isTokenExpired(token) {
  try {
    const payload = decodeTokenPayload(token)
    if (!payload.exp) return false
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

export function isAuthenticated() {
  const token = getToken()
  if (!token) return false
  if (isTokenExpired(token)) {
    clearToken()
    clearCurrentUser()
    return false
  }
  return true
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // localStorage indisponible (navigation privée, etc.)
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // localStorage indisponible
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setCurrentUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    // localStorage indisponible
  }
}

export function clearCurrentUser() {
  try {
    localStorage.removeItem(USER_KEY)
  } catch {
    // localStorage indisponible
  }
}

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function extractErrorMessage(response) {
  try {
    const body = await response.json()
    if (body?.error) return body.error
    if (body?.errors) {
      const firstField = Object.values(body.errors)[0]
      if (Array.isArray(firstField) && firstField.length > 0) return firstField[0]
    }
    if (body?.title) return body.title
  } catch {
    // corps non-JSON ou vide
  }
  return `Erreur ${response.status}`
}

function tokenExpiresInMs(token) {
  try {
    const payload = decodeTokenPayload(token)
    return payload.exp ? payload.exp * 1000 - Date.now() : Infinity
  } catch {
    return 0
  }
}

// Renouvellement glissant de la session : le jeton dure 30 min. S'il expire dans moins
// de 10 min, on en demande un nouveau avant l'appel. Un organisateur actif n'est donc
// plus déconnecté en plein travail ; une session inactive expire toujours normalement.
const REFRESH_WINDOW_MS = 10 * 60 * 1000
let refreshPromise = null

async function refreshTokenIfNeeded() {
  const token = getToken()
  if (!token) return
  const remaining = tokenExpiresInMs(token)
  if (remaining <= 0 || remaining > REFRESH_WINDOW_MS) return

  // Un seul renouvellement à la fois, même si plusieurs appels partent ensemble.
  refreshPromise ??= fetch(`${API_URL}/users/refresh-token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(async (res) => {
      if (!res.ok) return
      const data = await res.json()
      if (data?.token) setToken(data.token)
      if (data?.utilisateur) setCurrentUser(data.utilisateur)
    })
    .catch(() => {
      // Réseau indisponible : l'appel suivant réessaiera, le jeton actuel reste valide.
    })
    .finally(() => {
      refreshPromise = null
    })
  await refreshPromise
}

export async function apiFetch(path, { auth = true, headers, body, ...options } = {}) {
  const finalHeaders = { ...headers }
  let finalBody = body

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json'
    finalBody = JSON.stringify(body)
  }

  if (auth) {
    await refreshTokenIfNeeded()
    const token = getToken()
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: finalHeaders,
    body: finalBody,
  })

  if (!response.ok) {
    const message = await extractErrorMessage(response)
    if (response.status === 401 && auth) {
      clearToken()
      clearCurrentUser()
      if (typeof window !== 'undefined' && window.location.pathname !== '/connexion') {
        // Après reconnexion, on revient sur la page où la session a expiré.
        rememberReturnPath(`${window.location.pathname}${window.location.search}`)
        window.location.href = '/connexion'
      }
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return null
  return response.json().catch(() => null)
}
