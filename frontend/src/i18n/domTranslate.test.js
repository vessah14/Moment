import { describe, expect, it } from 'vitest'
import { setDictionary, translateText } from './domTranslate'
import EN_APP from './en-app'
import { EN } from './index'

describe('translateText', () => {
  setDictionary({
    'Mes événements': 'My events',
    'Envoyée le': 'Sent on',
    '{0} événement{1} · illimité': '{0} event{1} · unlimited',
    'Imprimer les {0}s': 'Print {0}s',
    carte: 'card',
    'Bonjour {0}': 'Hello {0}',
  })

  it('traduit une phrase exacte en gardant les espaces autour', () => {
    expect(translateText('Mes événements')).toBe('My events')
    expect(translateText('  Envoyée le ')).toBe('  Sent on ')
    expect(translateText('Mes\n      événements')).toBe('My events')
  })

  it('reconnaît les phrases à trous, pluriel vide compris', () => {
    expect(translateText('3 événements · illimité')).toBe('3 events · unlimited')
    expect(translateText('1 événement · illimité')).toBe('1 event · unlimited')
    expect(translateText('Bonjour Awa')).toBe('Hello Awa')
  })

  it('traduit aussi le morceau capturé quand il est au dictionnaire', () => {
    expect(translateText('Imprimer les cartes')).toBe('Print cards')
  })

  it('laisse tel quel ce qui est inconnu ou sans lettres', () => {
    expect(translateText('Awa & Ibrahim')).toBeNull()
    expect(translateText('12 / 40')).toBeNull()
    expect(translateText('')).toBeNull()
  })
})

describe('dictionnaire anglais complet', () => {
  it('ne contient aucune traduction vide', () => {
    const all = { ...EN_APP, ...EN }
    const empty = Object.entries(all).filter(([, v]) => typeof v !== 'string' || !v.trim())
    expect(empty).toEqual([])
  })

  it('garde dans la traduction les trous nommés de la clé', () => {
    const lost = Object.entries(EN_APP).filter(([fr, en]) => {
      const named = (fr.match(/\{\D\w*\}/g) ?? []).filter((v) => !/\{(prénom|nom|date|lieu|lien)\}/.test(v) || fr === v)
      return named.some((v) => !en.includes(v))
    })
    expect(lost).toEqual([])
  })
})
