import { describe, expect, it } from 'vitest'
import { eventSlugFromPath, isGuestPath, titleFromSlug } from './eventLook'

describe('event loader look', () => {
  it('recognises guest pages', () => {
    expect(isGuestPath('/e/mariage-paul')).toBe(true)
    expect(isGuestPath('/invitation/0b6e')).toBe(true)
    expect(isGuestPath('/cadeaux/mariage-paul')).toBe(true)
    expect(isGuestPath('/dashboard')).toBe(false)
    expect(isGuestPath('/evenements')).toBe(false)
    expect(isGuestPath('/')).toBe(false)
  })

  it('turns the event address into a readable title', () => {
    expect(titleFromSlug('conference-sur-la-digitalisation-du-recyclage')).toBe('Conference sur la digitalisation du recyclage')
    expect(titleFromSlug('')).toBe('')
  })

  it('reads the event slug from guest page addresses only', () => {
    expect(eventSlugFromPath('/e/mariage-paul')).toBe('mariage-paul')
    expect(eventSlugFromPath('/e/mariage-paul/mur')).toBe('mariage-paul')
    expect(eventSlugFromPath('/dashboard')).toBe('')
  })
})
