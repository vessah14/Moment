import { afterEach, describe, expect, it, vi } from 'vitest'

const eventId = 'b856965d-ea29-4b76-adda-531078547945'
const fileId = '826f4c2b-bdd4-4743-b470-ad645c7d15ca'

describe('isR2MediaUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('accepts only uploads hosted on the configured HTTPS R2 domain', async () => {
    vi.stubEnv('VITE_R2_PUBLIC_BASE_URL', 'https://media.example.com')
    const [{ isR2MediaUrl }, { safeBlockImagePath, safeCoverPath }, { mediaUrl }] = await Promise.all([
      import('./r2Media'),
      import('./sitePage'),
      import('../api/client'),
    ])

    expect(isR2MediaUrl(`https://media.example.com/tbf-moment/gallery/${eventId}/${fileId}.jpg`)).toBe(true)
    expect(safeCoverPath(`https://media.example.com/tbf-moment/covers/${eventId}/${fileId}.jpg`)).toBe(
      `https://media.example.com/tbf-moment/covers/${eventId}/${fileId}.jpg`,
    )
    expect(safeBlockImagePath(`https://media.example.com/tbf-moment/blocks/${eventId}/${fileId}.webp`)).toBe(
      `https://media.example.com/tbf-moment/blocks/${eventId}/${fileId}.webp`,
    )
    expect(mediaUrl(`https://media.example.com/tbf-moment/gallery/${eventId}/${fileId}.jpg`)).toBe(
      `https://media.example.com/tbf-moment/gallery/${eventId}/${fileId}.jpg`,
    )
    expect(isR2MediaUrl(`http://media.example.com/tbf-moment/gallery/${eventId}/${fileId}.jpg`)).toBe(false)
    expect(isR2MediaUrl(`https://attacker.example/tbf-moment/gallery/${eventId}/${fileId}.jpg`)).toBe(false)
    expect(isR2MediaUrl(`https://media.example.com/tbf-moment/gallery/${eventId}/${fileId}.jpg?track=1`)).toBe(false)
    expect(isR2MediaUrl('https://media.example.com/anything.png')).toBe(false)
  })

  it('rejects R2 URLs when no public domain is configured', async () => {
    vi.stubEnv('VITE_R2_PUBLIC_BASE_URL', '')
    const { isR2MediaUrl } = await import('./r2Media')

    expect(isR2MediaUrl(`https://media.example.com/tbf-moment/covers/${eventId}/${fileId}.jpg`)).toBe(false)
  })
})
