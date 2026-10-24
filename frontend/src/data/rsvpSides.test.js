import { describe, expect, it } from 'vitest'
import { RSVP_SIDES, rsvpSidesStarter, usableSides } from './rsvpSides'
import { TEMPLATES } from './templates'

describe('question « côté » du formulaire de réponse', () => {
  it('ne concerne que des modèles premium existants', () => {
    const themes = new Set(TEMPLATES.filter((t) => t.premium).map((t) => t.theme))
    for (const theme of Object.keys(RSVP_SIDES)) expect(themes.has(theme), theme).toBe(true)
  })

  it('part de choix génériques pour un nouvel événement', () => {
    expect(rsvpSidesStarter('toghu').sides).toEqual(['Famille de la mariée', 'Famille du marié', 'Les deux familles'])
    expect(rsvpSidesStarter('toge').sides).toEqual([])
    expect(rsvpSidesStarter('fiesta')).toEqual({})
    for (const { starter } of Object.values(RSVP_SIDES)) expect(usableSides(starter.sides ?? []).length).toBeLessThanOrEqual(8)
  })

  it('garde des choix nettoyés, comme le serveur', () => {
    expect(usableSides([' A ', '', 'B', 'A', 3, null])).toEqual(['A', 'B'])
    expect(usableSides(Array.from({ length: 12 }, (_, i) => `Choix ${i}`))).toHaveLength(8)
    expect(usableSides('A')).toEqual([])
  })
})
