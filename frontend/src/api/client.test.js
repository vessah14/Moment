import { afterEach, describe, expect, it, vi } from 'vitest'

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = (payload) => `${b64({ alg: 'HS256' })}.${b64(payload)}.signature`
const HOUR = 3600

function memoryStorage() {
  const data = new Map()
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  }
}

describe('renouvellement de la session', () => {
  it('renouvelle un jeton de 3 jours une fois par jour, pas à chaque appel', async () => {
    const { shouldRefreshToken } = await import('./client')
    const now = Date.UTC(2026, 10, 3, 12) / 1000
    const token = (ageHours) => jwt({ iat: now - ageHours * HOUR, exp: now - ageHours * HOUR + 72 * HOUR })

    expect(shouldRefreshToken(token(2), now * 1000)).toBe(false)
    expect(shouldRefreshToken(token(25), now * 1000)).toBe(true)
    // Jeton expiré : rien à renouveler, la page de connexion prend le relais.
    expect(shouldRefreshToken(token(73), now * 1000)).toBe(false)
  })

  it('garde l’ancienne règle (10 dernières minutes) pour un jeton sans date d’émission', async () => {
    const { shouldRefreshToken } = await import('./client')
    const now = Date.now()
    expect(shouldRefreshToken(jwt({ exp: Math.floor(now / 1000) + 20 * 60 }), now)).toBe(false)
    expect(shouldRefreshToken(jwt({ exp: Math.floor(now / 1000) + 5 * 60 }), now)).toBe(true)
  })
})

describe('« Se souvenir de moi »', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('garde la session (localStorage) ou la limite au navigateur ouvert (sessionStorage)', async () => {
    const local = memoryStorage()
    const session = memoryStorage()
    vi.stubGlobal('window', { localStorage: local, sessionStorage: session, dispatchEvent: () => true })
    vi.stubGlobal('Event', class {})
    const { getCurrentUser, getToken, setCurrentUser, setToken } = await import('./client')

    setToken('court', { persist: false })
    setCurrentUser({ id: 'u1' })
    expect(session.getItem('tbf_auth_token')).toBe('court')
    expect(local.getItem('tbf_auth_token')).toBeNull()
    // Renouvellement : le jeton reste dans la session du navigateur, avec le compte.
    setToken('court-2')
    expect(getToken()).toBe('court-2')
    expect(local.getItem('tbf_auth_token')).toBeNull()
    expect(getCurrentUser()).toEqual({ id: 'u1' })

    // Nouvelle connexion en cochant la case : tout passe dans localStorage.
    setToken('long', { persist: true })
    expect(local.getItem('tbf_auth_token')).toBe('long')
    expect(session.getItem('tbf_auth_token')).toBeNull()
    expect(getCurrentUser()).toEqual({ id: 'u1' })
  })
})
