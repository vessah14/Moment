import { describe, expect, it } from 'vitest'
import { createGuestTicketQr, normalizeGuestTicketId } from './ticketQr'

describe('QR des billets invités', () => {
  it('génère un QR distinct pour chaque identifiant invité', async () => {
    const first = await createGuestTicketQr('3f9a2c71-0000-4000-8000-000000000001')
    const second = await createGuestTicketQr('3f9a2c71-0000-4000-8000-000000000002')

    expect(first).toMatch(/^data:image\/png;base64,/)
    expect(second).toMatch(/^data:image\/png;base64,/)
    expect(second).not.toBe(first)
  })

  it('normalise les identifiants UUID sans perdre leur unicité', () => {
    expect(normalizeGuestTicketId('3F9A2C71-0000-4000-8000-000000000001')).toBe(
      '3f9a2c71-0000-4000-8000-000000000001',
    )
  })

  it('refuse de générer un billet sans identifiant invité valide', () => {
    expect(() => createGuestTicketQr('')).toThrow('Identifiant de billet invalide.')
  })
})
