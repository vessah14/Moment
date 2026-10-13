import { describe, expect, it } from 'vitest'
import { formatEventDate, statusLabel } from './eventStatus'

describe('statusLabel', () => {
  it('maps known backend statuses to French labels', () => {
    expect(statusLabel('Brouillon')).toBe('Brouillon')
    expect(statusLabel('Publie')).toBe('Publié')
    expect(statusLabel('Archive')).toBe('Archivé')
  })

  it('falls back to the raw value for an unknown status', () => {
    expect(statusLabel('Inconnu')).toBe('Inconnu')
  })
})

describe('formatEventDate', () => {
  it('returns a placeholder when there is no date', () => {
    expect(formatEventDate(null)).toBe('Date à définir')
    expect(formatEventDate('')).toBe('Date à définir')
  })

  it('formats a valid date', () => {
    const result = formatEventDate('2027-03-14')
    expect(result).toContain('2027')
  })

  it('returns the raw input for an unparsable date', () => {
    expect(formatEventDate('nope')).toBe('nope')
  })
})
