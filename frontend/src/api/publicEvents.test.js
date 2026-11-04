import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./client', () => ({
  apiFetch: vi.fn(),
  isAuthenticated: () => false,
}))

import { apiFetch } from './client'
import {
  clearPrefetchedPublicSite,
  getCachedPublicSite,
  getPublicSite,
  prefetchPublicSite,
} from './publicEvents'

const publicSite = { event: { name: 'Mariage' }, blocks: [] }

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
  clearPrefetchedPublicSite('mariage')
  clearPrefetchedPublicSite('mariage test')
  clearPrefetchedPublicSite('inconnu')
})

describe('chargement du site public', () => {
  it('réessaie après une erreur réseau temporaire puis met la réponse en cache', async () => {
    const stored = new Map()
    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: key => stored.get(key) ?? null,
        setItem: (key, value) => stored.set(key, value),
        removeItem: key => stored.delete(key),
      },
    })
    vi.useFakeTimers()
    apiFetch
      .mockRejectedValueOnce(Object.assign(new Error('network'), { status: 0 }))
      .mockResolvedValueOnce(publicSite)

    const pending = getPublicSite('mariage test')
    await vi.advanceTimersByTimeAsync(400)

    await expect(pending).resolves.toEqual(publicSite)
    expect(apiFetch).toHaveBeenCalledTimes(2)
    expect(apiFetch).toHaveBeenLastCalledWith('/public/events/mariage%20test/site', {
      auth: false,
      signal: expect.any(AbortSignal),
    })
    expect(getCachedPublicSite('mariage test')).toEqual(publicSite)
  })

  it('ne réessaie pas si le site est introuvable', async () => {
    apiFetch.mockRejectedValueOnce(Object.assign(new Error('not found'), { status: 404 }))

    await expect(getPublicSite('inconnu')).rejects.toMatchObject({ status: 404 })
    expect(apiFetch).toHaveBeenCalledTimes(1)
  })

  it('réutilise le préchargement anticipé quand la page événement se monte', async () => {
    apiFetch.mockResolvedValueOnce(publicSite)

    const preloaded = prefetchPublicSite('mariage')
    const pageRequest = getPublicSite('mariage', { signal: new AbortController().signal })

    await expect(pageRequest).resolves.toEqual(publicSite)
    await expect(preloaded).resolves.toEqual(publicSite)
    expect(apiFetch).toHaveBeenCalledTimes(1)
  })

  it('annule les nouvelles tentatives quand la page est quittée', async () => {
    const controller = new AbortController()
    apiFetch.mockRejectedValueOnce(Object.assign(new Error('network'), { status: 0 }))

    vi.useFakeTimers()
    const pending = getPublicSite('mariage', { signal: controller.signal })
    await Promise.resolve()
    await Promise.resolve()
    controller.abort()

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(apiFetch).toHaveBeenCalledTimes(1)
  })
})
