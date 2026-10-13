import { describe, expect, it } from 'vitest'
import { formatEventDate, formatTimeRange } from './formatDate'

describe('formatEventDate', () => {
  it('returns an empty string for a falsy input', () => {
    expect(formatEventDate('')).toBe('')
    expect(formatEventDate(null)).toBe('')
  })

  it('formats a valid ISO date in French', () => {
    const result = formatEventDate('2027-03-14')
    expect(result).toContain('2027')
    expect(result).toMatch(/mars/i)
  })

  it('returns the raw input for an unparsable date', () => {
    expect(formatEventDate('not-a-date')).toBe('not-a-date')
  })
})

describe('formatTimeRange', () => {
  it('returns an empty string when there is no start time', () => {
    expect(formatTimeRange({})).toBe('')
  })

  it('returns just the start time when there is no end time', () => {
    expect(formatTimeRange({ timeStart: '16:00' })).toBe('16:00')
  })

  it('joins start and end time with a dash', () => {
    expect(formatTimeRange({ timeStart: '16:00', timeEnd: '23:00' })).toBe('16:00 - 23:00')
  })
})
