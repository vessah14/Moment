import { describe, expect, it } from 'vitest'
import { eventUsagePercent, isEventLimitReached } from './usePlan'

describe('eventUsagePercent', () => {
  it('calculates and caps event quota progress', () => {
    expect(eventUsagePercent({ eventsUsed: 1, maxEvents: 3 })).toBe(33)
    expect(eventUsagePercent({ eventsUsed: 3, maxEvents: 3 })).toBe(100)
    expect(eventUsagePercent({ eventsUsed: 4, maxEvents: 3 })).toBe(100)
  })

  it('does not show a quota gauge for unlimited or unavailable plans', () => {
    expect(eventUsagePercent({ eventsUsed: 4, maxEvents: null })).toBeNull()
    expect(eventUsagePercent(null)).toBeNull()
  })
})

describe('isEventLimitReached', () => {
  it('uses the configured event cap', () => {
    expect(isEventLimitReached({ eventsUsed: 2, maxEvents: 3 })).toBe(false)
    expect(isEventLimitReached({ eventsUsed: 3, maxEvents: 3 })).toBe(true)
  })
})
