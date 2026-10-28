import { describe, expect, it } from 'vitest'
import { cacheGuestList, dequeueCheckin, enqueueCheckin, flushQueue, readGuestList, readQueue, withQueued } from './offlineCheckins'

function memoryStorage() {
  const data = new Map()
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  }
}

const apiError = () => Object.assign(new Error('Déjà pointé'), { name: 'ApiError' })

describe('offline check-ins', () => {
  it('queues each guest once per event', () => {
    const s = memoryStorage()
    enqueueCheckin('evt', 'g1', '2026-12-19T10:00:00Z', s)
    enqueueCheckin('evt', 'g1', '2026-12-19T10:05:00Z', s)
    enqueueCheckin('other', 'g2', '2026-12-19T10:00:00Z', s)
    expect(readQueue('evt', s)).toEqual([{ guestId: 'g1', at: '2026-12-19T10:05:00Z' }])
    dequeueCheckin('evt', 'g1', s)
    expect(readQueue('evt', s)).toEqual([])
  })

  it('sends the queue, drops refused entries and stops when the network is still down', async () => {
    const s = memoryStorage()
    for (const id of ['ok', 'refused', 'offline', 'later']) enqueueCheckin('evt', id, '2026-12-19T10:00:00Z', s)
    const send = async (id) => {
      if (id === 'refused') throw apiError()
      if (id === 'offline') throw new TypeError('Failed to fetch')
      return { id, checkedInAt: 'server' }
    }

    const sent = await flushQueue('evt', send, s)

    expect(sent).toEqual([{ guestId: 'ok', guest: { id: 'ok', checkedInAt: 'server' } }, { guestId: 'refused', guest: null }])
    expect(readQueue('evt', s).map((i) => i.guestId)).toEqual(['offline', 'later'])
  })

  it('marks queued guests as arrived on top of the server list', () => {
    const guests = [{ id: 'a', checkedInAt: null }, { id: 'b', checkedInAt: 'x' }]
    expect(withQueued(guests, [{ guestId: 'a', at: 't' }, { guestId: 'b', at: 'y' }])).toEqual([
      { id: 'a', checkedInAt: 't', pendingSync: true },
      { id: 'b', checkedInAt: 'x' },
    ])
  })
})

describe('guest list cache', () => {
  it('keeps only what reception needs, without email or phone', () => {
    const storage = memoryStorage()
    cacheGuestList('e1', [{ id: 'g1', fullName: 'Paul Ekané', email: 'p@x.cm', phone: '677', status: 'Present', side: 'Commercial', extra: true, checkedInAt: null }], storage)
    const saved = readGuestList('e1', storage)
    expect(saved.guests).toEqual([{ id: 'g1', fullName: 'Paul Ekané', email: '', phone: '', status: 'Present', side: 'Commercial', extra: true, checkedInAt: null }])
    expect(storage.getItem('tbf_checkin_guests_e1')).not.toMatch(/p@x\.cm|677/)
    expect(readGuestList('autre', storage)).toBeNull()
  })
})
