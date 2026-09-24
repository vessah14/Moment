import { describe, expect, it } from 'vitest'
import { formatFcfa } from './formatCurrency'

describe('formatFcfa', () => {
  it('appends the FCFA suffix', () => {
    expect(formatFcfa(0)).toBe('0 FCFA')
  })

  it('groups thousands with the French locale separator', () => {
    expect(formatFcfa(1234567)).toBe(`${(1234567).toLocaleString('fr-FR')} FCFA`)
  })
})
