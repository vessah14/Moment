import { beforeEach, describe, expect, it } from 'vitest'
import { consumeOAuthState, createOAuthState } from './oauthState'

// Environnement Node : sessionStorage minimal en mémoire.
const store = new Map()
globalThis.sessionStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
}

describe('OAuth state', () => {
  beforeEach(() => sessionStorage.clear())

  it('accepts the state created in this tab, only once', () => {
    const state = createOAuthState()
    expect(state).toMatch(/^[0-9a-f]{32}$/)
    expect(consumeOAuthState(state)).toBe(true)
    expect(consumeOAuthState(state)).toBe(false)
  })

  it('rejects a forged or missing state', () => {
    createOAuthState()
    expect(consumeOAuthState('forged')).toBe(false)
    expect(consumeOAuthState(null)).toBe(false)
  })
})
