import { describe, expect, it } from 'vitest'
import { NO_MUSIC, resolveEventMusic } from './eventMusic'

describe('event music', () => {
  it('uses the organizer choice first', () => {
    expect(resolveEventMusic({ choice: 'balafon', themeMusic: 'harpe', eventType: 'mariage' })).toBe('balafon')
  })

  it('lets the organizer turn the music off', () => {
    expect(resolveEventMusic({ choice: NO_MUSIC, themeMusic: 'harpe' })).toBeNull()
  })

  it('falls back to the premium template music, then to the event type', () => {
    expect(resolveEventMusic({ choice: '', themeMusic: 'pulse', eventType: 'mariage' })).toBe('pulse')
    expect(resolveEventMusic({ eventType: 'mariage' })).toBe('harpe')
    expect(resolveEventMusic({ eventType: 'obseques' })).toBe('recueil')
  })

  it('gives every other event a default music', () => {
    expect(resolveEventMusic({ eventType: 'conference' })).toBe('lounge')
    expect(resolveEventMusic()).toBe('lounge')
    expect(resolveEventMusic({ choice: 'inconnu' })).toBe('lounge')
  })
})
