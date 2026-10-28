import { describe, expect, it } from 'vitest'
import { ENVOL_EN, identity, makeTranslator } from './envolI18n'
import { TEMPLATES } from '../../../../data/templates'

describe('makeTranslator', () => {
  it('traduit les textes du modèle et laisse les textes de l’organisateur', () => {
    const t = makeTranslator(ENVOL_EN, 'en')
    expect(t('Confirmez votre présence')).toBe('Confirm your attendance')
    expect(t(' Le mur des vœux ')).toBe('The wishes wall')
    expect(t('Venez nombreux au siège !')).toBe('Venez nombreux au siège !')
    expect(t.locale).toBe('en-GB')
    expect(identity('Confirmez votre présence')).toBe('Confirmez votre présence')
    expect(makeTranslator(ENVOL_EN, 'fr')('Tenue')).toBe('Tenue')
  })

  it('couvre tous les titres et textes fixes du modèle Envol et de ses variantes', () => {
    const envol = TEMPLATES.find((t) => t.name === 'Envol')
    const texts = [
      ...Object.values(envol.headings),
      ...Object.values(envol.content).flatMap((c) => [c.body, c.title]),
      ...Object.values(envol.variants).flatMap((v) => [
        ...Object.values(v.headings ?? {}),
        ...Object.values(v.content ?? {}).flatMap((c) => [c.body, c.title]),
      ]),
    ].filter(Boolean)
    const t = makeTranslator(ENVOL_EN, 'en')
    for (const text of texts) expect(t(text), text).not.toBe(text)
  })
})
