const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5146/api'
const TOKEN_KEY = 'tbf_admin_token'
const ADMIN_KEY = 'tbf_admin_account'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
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

export function getCurrentAdmin() {
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setCurrentAdmin(admin) {
  try {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
  } catch {
    // localStorage indisponible
  }
}

export function clearCurrentAdmin() {
  try {
    localStorage.removeItem(ADMIN_KEY)
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
      clearCurrentAdmin()
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin/connexion') {
        window.location.href = '/admin/connexion'
      }
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return null
  return response.json().catch(() => null)
}
