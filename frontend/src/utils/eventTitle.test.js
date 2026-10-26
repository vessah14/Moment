import { describe, expect, it } from 'vitest'
import {
  displayNameFromTitle,
  eventRequiresAge,
  formatEventDisplayTitle,
} from './eventTitle'

describe('event display titles', () => {
  it('requires ages for birthdays and wedding anniversaries', () => {
    expect(eventRequiresAge('anniversaire')).toBe(true)
    expect(eventRequiresAge('noces')).toBe(true)
    expect(eventRequiresAge('mariage')).toBe(false)
  })

  it('formats each age-based title with its distinct wording', () => {
    expect(formatEventDisplayTitle('anniversaire', 30, 'Awa')).toBe('Les 30 ans de Awa')
    expect(formatEventDisplayTitle('noces', 10, 'Awa & Ibrahim')).toBe(
      'Les 10 ans de mariage de Awa & Ibrahim',
    )
  })

  it('recovers the display text when editing an existing age-based title', () => {
    expect(displayNameFromTitle('Les 10 ans de mariage de Awa & Ibrahim')).toBe(
      'Awa & Ibrahim',
    )
  })
})
