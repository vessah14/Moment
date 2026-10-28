import { describe, expect, it } from 'vitest'
import { makeTranslator } from './envol/envolI18n'
import { MINUIT_EN } from './minuitI18n'
import { getSiteTheme } from './themeDefs'
import { parseDateTimeInTimeZone } from '../../../utils/minuitTime'

describe('Minuit English translations', () => {
  it('translates the invitation, host section, countdown and New Year wishes', () => {
    const t = makeTranslator(MINUIT_EN, 'en')
    expect(t('Saint-Sylvestre · 31 décembre')).toBe("New Year's Eve · December 31")
    expect(t('Avant minuit')).toBe('Until midnight')
    expect(t('Vos hôtes')).toBe('Your hosts')
    expect(t('Publier mon vœu')).toBe('Post my wish')
  })

  it('keeps organiser-provided copy unchanged when it has no translation', () => {
    const t = makeTranslator(MINUIT_EN, 'en')
    expect(t('Texte personnalisé')).toBe('Texte personnalisé')
  })

  it('uses the Douala midnight for New Year, but the event start for gala variants', () => {
    const minuit = getSiteTheme('minuit')
    const newYearStart = parseDateTimeInTimeZone('2026-12-31T20:00:00')
    const galaStart = parseDateTimeInTimeZone('2026-12-18T19:00:00')
    expect(minuit.countdownTo(newYearStart).toISOString()).toBe('2026-12-31T23:00:00.000Z')
    expect(minuit.countdownTo(newYearStart, { target: 'debut' })).toBe(newYearStart)
    expect(minuit.countdownTo(galaStart)).toBe(galaStart)
    expect(minuit.countdownDone(new Date('2026-12-31T23:00:00.000Z')).title).toBe('Bonne année 2027 !')
    expect(minuit.countdownDone(galaStart)).toBeNull()
  })
})
