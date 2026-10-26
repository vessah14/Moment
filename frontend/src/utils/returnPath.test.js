import { afterEach, describe, expect, it, vi } from 'vitest'
import { peekReturnPath, rememberReturnPath, returnPathFrom } from './returnPath'

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
})
