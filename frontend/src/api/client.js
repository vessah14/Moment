import { rememberReturnPath } from '../utils/returnPath'
import { isR2MediaUrl, isR2VoiceUrl } from '../utils/r2Media'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5146/api'
const TOKEN_KEY = 'tbf_auth_token'
const USER_KEY = 'tbf_auth_user'
export const CURRENT_USER_UPDATED_EVENT = 'tbf:current-user-updated'

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

// URL d'affichage d'une image téléversée : chemins locaux, Cloudinary et domaine public R2.
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
  if (isR2MediaUrl(path)) return path
  return path.startsWith('/') ? `${API_ORIGIN}${path}` : ''
}

// URL d'écoute d'un message vocal téléversé : R2, Cloudinary (rangé avec les vidéos) ou
// fichier local. Toute autre adresse est ignorée.
const VOICE_FILE = /\/voices\/[0-9a-fA-F-]{36}\/[0-9a-fA-F-]{36}\.(?:webm|ogg|m4a|mp3)$/
export function voiceUrl(path) {
  if (typeof path !== 'string' || !VOICE_FILE.test(path)) return ''
  if (isR2VoiceUrl(path) || path.startsWith('https://res.cloudinary.com/')) return path
  return path.startsWith('/uploads/voices/') ? `${API_ORIGIN}${path}` : ''
}

// Où vit la session : localStorage pour rester connecté (« Se souvenir de moi », 3 jours
// prolongés à chaque visite), sessionStorage pour une session fermée avec le navigateur
// (ordinateur partagé). Le compte (USER_KEY) suit toujours le jeton dans le même stockage.
function safeStorage(name) {
  try {
    return typeof window !== 'undefined' ? window[name] : null
  } catch {
    return null // stockage bloqué (navigation privée, réglages du navigateur)
  }
}

function read(storage, key) {
  try {
    return storage?.getItem(key) ?? null
  } catch {
    return null
  }
}

function sessionStore() {
  return read(safeStorage('sessionStorage'), TOKEN_KEY) ? safeStorage('sessionStorage') : safeStorage('localStorage')
}

export function getToken() {
  return read(safeStorage('localStorage'), TOKEN_KEY) ?? read(safeStorage('sessionStorage'), TOKEN_KEY)
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

// persist : true = rester connecté, false = jusqu'à la fermeture du navigateur ; absent
// (renouvellement du jeton), la session reste là où elle est.
export function setToken(token, { persist } = {}) {
  const local = safeStorage('localStorage')
  const session = safeStorage('sessionStorage')
  const target = persist === undefined ? sessionStore() : persist ? local : session
  const other = target === local ? session : local
  try {
    // Le compte déménage avec le jeton, l'ancien emplacement est vidé.
    const user = read(other, USER_KEY)
    other?.removeItem(TOKEN_KEY)
    other?.removeItem(USER_KEY)
    target?.setItem(TOKEN_KEY, token)
    if (user && !read(target, USER_KEY)) target?.setItem(USER_KEY, user)
  } catch {
    // stockage indisponible (navigation privée, etc.)
  }
}

export function clearToken() {
  for (const storage of [safeStorage('localStorage'), safeStorage('sessionStorage')]) {
    try {
      storage?.removeItem(TOKEN_KEY)
    } catch {
      // stockage indisponible
    }
  }
}

export function getCurrentUser() {
  try {
    const raw = read(sessionStore(), USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setCurrentUser(user) {
  try {
    sessionStore()?.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    // stockage indisponible
  }
  if (typeof window !== 'undefined')
    window.dispatchEvent(new Event(CURRENT_USER_UPDATED_EVENT))
}

export function clearCurrentUser() {
  for (const storage of [safeStorage('localStorage'), safeStorage('sessionStorage')]) {
    try {
      storage?.removeItem(USER_KEY)
    } catch {
      // stockage indisponible
    }
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
  // Page d'erreur du proxy ou de l'hébergeur (API redémarrée, en maintenance…).
  if (response.status >= 500) return 'Le service est momentanément indisponible. Réessayez dans un instant.'
  if (response.status === 429) return 'Trop de tentatives. Patientez une minute avant de réessayer.'
  return `Erreur ${response.status}`
}

const NETWORK_ERROR = 'Connexion au serveur impossible. Vérifiez votre connexion internet, puis réessayez.'

// Renouvellement glissant de la session : le jeton organisateur dure 3 jours. Passé le
// premier tiers de sa durée (un jour), le premier appel en demande un nouveau : chaque
// visite repousse la déconnexion de 3 jours, dans la limite fixée par l'API (30 jours
// après la connexion). Jeton sans date d'émission (iat) : dans ses 10 dernières minutes.
const LEGACY_REFRESH_WINDOW_MS = 10 * 60 * 1000
let refreshPromise = null
// Jeton dont le renouvellement a été refusé (fin de session) : on ne redemande pas à chaque appel.
let refusedToken = null

export function shouldRefreshToken(token, now = Date.now()) {
  try {
    const { iat, exp } = decodeTokenPayload(token)
    if (!exp || now >= exp * 1000) return false
    if (!iat) return exp * 1000 - now <= LEGACY_REFRESH_WINDOW_MS
    return now - iat * 1000 >= ((exp - iat) * 1000) / 3
  } catch {
    return false
  }
}

async function refreshTokenIfNeeded() {
  const token = getToken()
  if (!token || token === refusedToken || !shouldRefreshToken(token)) return

  // Un seul renouvellement à la fois, même si plusieurs appels partent ensemble.
  refreshPromise ??= fetch(`${API_URL}/users/refresh-token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(async (res) => {
      if (res.status === 401) refusedToken = token
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

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: finalHeaders,
      body: finalBody,
    })
  } catch (err) {
    // Requête annulée volontairement : on laisse passer l'AbortError telle quelle.
    if (err?.name === 'AbortError') throw err
    // Hors ligne, API injoignable… : « Failed to fetch » ne dit rien à l'utilisateur.
    throw new ApiError(NETWORK_ERROR, 0)
  }

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
