const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5146/api'
const TOKEN_KEY = 'tbf_auth_token'
const USER_KEY = 'tbf_auth_user'

// Origine du backend (sans le suffixe /api), pour construire les URLs de fichiers
// uploadés (galerie) renvoyées en chemins relatifs par l'API.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

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
    const payload = JSON.parse(atob(token.split('.')[1]))
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

export async function apiFetch(path, { auth = true, headers, body, ...options } = {}) {
  const finalHeaders = { ...headers }
  let finalBody = body

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json'
    finalBody = JSON.stringify(body)
  }

  if (auth) {
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
        window.location.href = '/connexion'
      }
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return null
  return response.json().catch(() => null)
}
