import { describe, expect, it } from 'vitest'
import { guestMessageUrl, internationalNumber, nextUnsent, readSent, writeSent } from './whatsapp'

function memoryStorage() {
  const data = new Map()
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: (k) => data.delete(k) }
}

describe('internationalNumber', () => {
  it.each([
    ['690 00 00 00', '237690000000'],
    ['+237 6 90 00 00 00', '237690000000'],
    ['00237690000000', '237690000000'],
    ['233 42 12 34', '237233421234'],
    ['+33 6 12 34 56 78', '33612345678'],
  ])('%s → %s', (input, expected) => {
    expect(internationalNumber(input)).toBe(expected)
  })

  it('rejects empty or too short numbers', () => {
    expect(internationalNumber('')).toBeNull()
    expect(internationalNumber('12345')).toBeNull()
  })
})

describe('guestMessageUrl', () => {
  it('opens the guest chat when the number is known', () => {
    expect(guestMessageUrl('WhatsApp', '690000000', 'Salut')).toBe('https://wa.me/237690000000?text=Salut')
    expect(guestMessageUrl('WhatsApp', '', 'Salut')).toBe('https://wa.me/?text=Salut')
    expect(guestMessageUrl('SMS', '690000000', 'Salut')).toBe('sms:+237690000000?body=Salut')
    expect(guestMessageUrl('SMS', '', 'Salut')).toBe('')
  })
})

describe('series sending', () => {
  it('remembers contacted guests and finds the next one', () => {
    const s = memoryStorage()
    writeSent('evt', 'WhatsApp', new Set(['a', 'b']), s)
    const sent = readSent('evt', 'WhatsApp', s)
    const guests = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
    expect(nextUnsent(guests, sent, 'b')).toEqual({ id: 'c' })
    expect(nextUnsent(guests, new Set(['a', 'b', 'c']), 'd')).toBeNull()
    expect(nextUnsent(guests, new Set(['c', 'd']), 'd')).toEqual({ id: 'a' })
    expect(readSent('evt', 'SMS', s).size).toBe(0)
  })
})
