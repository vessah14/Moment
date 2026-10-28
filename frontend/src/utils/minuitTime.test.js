import { describe, expect, it } from 'vitest'
import {
  isNewYearMidnight,
  isSameDayInTimeZone,
  minuitCountdownTarget,
  nextMidnightInTimeZone,
  parseDateTimeInTimeZone,
  timeZoneYear,
} from './minuitTime'

describe('minuitTime', () => {
  it('targets midnight in Douala regardless of the browser timezone', () => {
    const target = nextMidnightInTimeZone(new Date('2026-12-31T20:00:00.000Z'))
    expect(target.toISOString()).toBe('2026-12-31T23:00:00.000Z')
    expect(isNewYearMidnight(target)).toBe(true)
    expect(timeZoneYear(target)).toBe(2027)
  })

  it('targets the event start for gala variants and non-New-Year events', () => {
    const gala = new Date('2026-12-18T18:00:00.000Z')
    const newYearStart = new Date('2026-12-31T19:00:00.000Z')
    expect(minuitCountdownTarget(gala)).toBe(gala)
    expect(minuitCountdownTarget(newYearStart, 'debut')).toBe(newYearStart)
    expect(minuitCountdownTarget(newYearStart).toISOString()).toBe('2026-12-31T23:00:00.000Z')
  })

  it('compares calendar days in the event timezone', () => {
    expect(isSameDayInTimeZone('2027-01-01T00:30:00.000Z', '2026-12-31T23:30:00.000Z')).toBe(true)
    expect(isSameDayInTimeZone('2027-01-01T00:30:00.000Z', '2027-01-01T23:30:00.000Z')).toBe(false)
  })

  it('interprets timezone-free event dates as wall time in Douala', () => {
    expect(parseDateTimeInTimeZone('2026-12-31T20:00:00').toISOString()).toBe('2026-12-31T19:00:00.000Z')
    expect(parseDateTimeInTimeZone('2026-12-31T20:00:00Z').toISOString()).toBe('2026-12-31T20:00:00.000Z')
  })
})
