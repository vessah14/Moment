import { describe, expect, it } from 'vitest'
import { GUEST_STATUS_BY_LABEL, guestStatusLabel } from './guestStatus'

describe('guestStatusLabel', () => {
  it('maps known backend statuses to French labels', () => {
    expect(guestStatusLabel('Present')).toBe('Confirmé')
    expect(guestStatusLabel('Absent')).toBe('Refus')
    expect(guestStatusLabel('EnAttente')).toBe('En attente')
  })

  it('falls back to the raw value for an unknown status', () => {
    expect(guestStatusLabel('Mystere')).toBe('Mystere')
  })
})

describe('GUEST_STATUS_BY_LABEL', () => {
  it('is the exact inverse of the label map', () => {
    expect(GUEST_STATUS_BY_LABEL['Confirmé']).toBe('Present')
    expect(GUEST_STATUS_BY_LABEL['Refus']).toBe('Absent')
    expect(GUEST_STATUS_BY_LABEL['En attente']).toBe('EnAttente')
  })
})
