import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./client', () => ({
  apiFetch: vi.fn(async () => ({ token: 'access-token', utilisateur: { id: 'user-1' } })),
  clearCurrentUser: vi.fn(),
  clearToken: vi.fn(),
  getToken: vi.fn(),
  setCurrentUser: vi.fn(),
  setToken: vi.fn(),
}))

import { apiFetch, setCurrentUser, setToken } from './client'
import { login } from './auth'

afterEach(() => vi.clearAllMocks())

describe('connexion persistante', () => {
  it('transmet la préférence « se souvenir de moi » à l’API', async () => {
    await login({ email: 'user@example.com', password: 'password', remember: true })

    expect(apiFetch).toHaveBeenCalledWith('/users/login', {
      method: 'POST',
      auth: false,
      body: { email: 'user@example.com', password: 'password', rememberMe: true },
    })
    expect(setToken).toHaveBeenCalledWith('access-token', { persist: true })
    expect(setCurrentUser).toHaveBeenCalledWith({ id: 'user-1' })
  })

  it('préserve la session courte si la case est décochée', async () => {
    await login({ email: 'user@example.com', password: 'password', remember: false })

    expect(apiFetch).toHaveBeenCalledWith('/users/login', expect.objectContaining({
      body: { email: 'user@example.com', password: 'password', rememberMe: false },
    }))
    expect(setToken).toHaveBeenCalledWith('access-token', { persist: false })
  })
})
