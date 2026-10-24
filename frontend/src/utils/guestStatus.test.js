import { describe, expect, it } from 'vitest'
import { GUEST_STATUS_BY_FILTER, guestStatusLabel, hasGuestStatus } from './guestStatus'

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

describe('GUEST_STATUS_BY_FILTER', () => {
  it('maps each dashboard filter label to its backend status', () => {
    expect(GUEST_STATUS_BY_FILTER.Confirmés).toBe('Present')
    expect(GUEST_STATUS_BY_FILTER.Refus).toBe('Absent')
    expect(GUEST_STATUS_BY_FILTER['En attente']).toBe('EnAttente')
  })
})

describe('hasGuestStatus', () => {
  it('matches status values without case or surrounding whitespace differences', () => {
    expect(hasGuestStatus(' present ', 'Present')).toBe(true)
    expect(hasGuestStatus('EnAttente', 'enattente')).toBe(true)
    expect(hasGuestStatus('Absent', 'Present')).toBe(false)
  })
})
