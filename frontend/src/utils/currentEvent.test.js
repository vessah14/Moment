import { describe, expect, it } from 'vitest'
import { pickCurrentEvent } from './currentEvent'

const events = [{ id: 'a' }, { id: 'b' }]

describe('pickCurrentEvent', () => {
  it('keeps the event chosen on another dashboard page', () => {
    expect(pickCurrentEvent(events, 'b')).toBe('b')
  })

  it('falls back to the first event when the remembered one is gone', () => {
    expect(pickCurrentEvent(events, 'deleted')).toBe('a')
  })

  it('falls back to the first event when nothing is remembered', () => {
    expect(pickCurrentEvent(events, null)).toBe('a')
  })

  it('falls back to the first event when storage is unavailable', () => {
    // no window under the node test environment: reading the storage fails quietly
    expect(pickCurrentEvent(events)).toBe('a')
  })

  it('returns an empty id for an empty list', () => {
    expect(pickCurrentEvent([], 'a')).toBe('')
  })
})
