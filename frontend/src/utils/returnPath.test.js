import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  loginPathForReturnPath,
  peekReturnPath,
  peekSignupReturnPath,
  consumeSignupReturnPath,
  rememberReturnPath,
  rememberSignupReturnPath,
  requestedReturnPath,
  returnPathFrom,
  returnPathFromSearch,
} from './returnPath'

describe('returnPath', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps the selected template in the internal return URL', () => {
    expect(returnPathFrom({
      state: {
        from: {
          pathname: '/dashboard/evenements/nouveau',
          search: '?modele=Noor',
        },
      },
    })).toBe('/dashboard/evenements/nouveau?modele=Noor')
  })

  it('does not accept an external return URL', () => {
    expect(returnPathFrom({ state: { from: { pathname: '//example.com' } } })).toBeNull()
  })

  it('restores a return path from the login URL after a reload', () => {
    const path = '/dashboard/evenements/nouveau?modele=Noor'
    const loginUrl = loginPathForReturnPath(path)
    const search = loginUrl.split('?')[1]

    expect(returnPathFromSearch(search)).toBe(path)
    expect(requestedReturnPath({ search })).toBe(path)
    expect(loginUrl).toContain('modele=Noor')
  })

  it('rejects external return paths from the login URL', () => {
    expect(returnPathFromSearch('?retour=%2F%2Fexample.com')).toBeNull()
  })

  it('remembers and reads back only internal paths', () => {
    const values = new Map()
    vi.stubGlobal('sessionStorage', {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    })

    rememberReturnPath('/dashboard/evenements/nouveau?modele=Noor')
    expect(peekReturnPath()).toBe('/dashboard/evenements/nouveau?modele=Noor')

    rememberReturnPath('//example.com')
    expect(peekReturnPath()).toBeNull()
  })

  it('preserves signup destinations across tabs and consumes them once', () => {
    const values = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    })

    const path = '/tarifs?offre=premium'
    rememberSignupReturnPath(path)
    expect(peekSignupReturnPath()).toBe(path)
    expect(consumeSignupReturnPath()).toBe(path)
    expect(peekSignupReturnPath()).toBeNull()
  })

  it('rejects external signup return destinations', () => {
    const values = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    })

    rememberSignupReturnPath('//example.com')
    expect(peekSignupReturnPath()).toBeNull()
  })
})
