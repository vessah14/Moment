import { describe, expect, it } from 'vitest'
import { clsFromShifts, pageGroup } from './webVitals'

describe('vitesse réelle des visiteurs', () => {
  it('regroupe les pages sans garder leur adresse', () => {
    expect(pageGroup('/')).toBe('accueil')
    expect(pageGroup('/e/mariage-grace')).toBe('evenement')
    expect(pageGroup('/e/mariage-grace/mur')).toBe('mur')
    expect(pageGroup('/invitation/abc')).toBe('invitation')
    expect(pageGroup('/dashboard/participants')).toBe('tableau-de-bord')
    expect(pageGroup('/tarifs')).toBe('autre')
  })

  it('calcule le CLS sur la plus grande fenêtre de décalages', () => {
    const shifts = [
      { startTime: 100, value: 0.05 },
      { startTime: 600, value: 0.05 },
      { startTime: 900, value: 0.2, hadRecentInput: true },
      { startTime: 4000, value: 0.08 },
    ]
    expect(clsFromShifts(shifts)).toBeCloseTo(0.1)
    expect(clsFromShifts([])).toBe(0)
  })
})
