import { describe, expect, it } from 'vitest'
import { infoErrors } from '../components/wizard/InfoStep'
import { modelsForType } from '../components/wizard/ModelStep'
import { EVENT_TYPES, EVENT_UNIVERSES, eventTypeFor, nextFixedDate } from './eventTypes'
import { TEMPLATES } from './templates'
import { templatesForEventType } from '../utils/templateTheme'

// Catégories de la table event_categories (migrations comprises).
const SERVER_CATEGORIES = [
  'anniversaire', 'autre', 'baby_shower', 'bapteme', 'competition_sportive', 'concert', 'conference',
  'evenement_entreprise', 'evenement_religieux', 'evenement_scolaire', 'fetes_saisons', 'graduation', 'mariage',
  'obseques', 'personnalise', 'retrait_deuil', 'reunion_familiale', 'soiree_privee',
]

describe("types d'événement de l'assistant", () => {
  it('rangent chaque type dans un univers connu, avec une catégorie du serveur', () => {
    const universes = new Set(EVENT_UNIVERSES.map((u) => u.id))
    for (const t of EVENT_TYPES) {
      expect(universes.has(t.univers), t.id).toBe(true)
      expect(SERVER_CATEGORIES, t.id).toContain(t.categoryCode)
      expect(['required', 'suggested', 'optional'], t.id).toContain(t.logo)
    }
  })

  it('proposent des modèles premium qui existent, le modèle conçu en premier', () => {
    for (const t of EVENT_TYPES) {
      const models = modelsForType(t)
      expect(models[0]?.theme, t.id).toBe(t.templates[0])
      for (const theme of t.templates) expect(TEMPLATES.some((tpl) => tpl.theme === theme), `${t.id} → ${theme}`).toBe(true)
    }
  })

  it('limite les modèles premium proposés au type exact de l’événement', () => {
    const birthdayModels = templatesForEventType('anniversaire', 'anniversaire')
    const anniversaryModels = templatesForEventType('noces', 'anniversaire')

    expect(birthdayModels.map((model) => model.theme).slice(0, 2)).toEqual(['fiesta', 'prestige'])
    expect(anniversaryModels.map((model) => model.theme).slice(0, 2)).toEqual(['prestige', 'bloom'])
    expect(anniversaryModels.some((model) => model.theme === 'fiesta')).toBe(false)
  })

  it('utilisent les 27 modèles premium', () => {
    const used = new Set(EVENT_TYPES.flatMap((t) => t.templates))
    expect(used.size).toBe(TEMPLATES.filter((t) => t.premium).length)
  })

  it("retrouvent le type d'un événement existant", () => {
    expect(eventTypeFor('kermesse', 'evenement_scolaire').id).toBe('kermesse')
    expect(eventTypeFor(undefined, 'graduation').id).toBe('graduation')
    expect(eventTypeFor(undefined, 'inconnue')).toBeNull()
  })

  it('proposent la prochaine date des fêtes à jour fixe', () => {
    expect(nextFixedDate('12-25', new Date(2026, 9, 22))).toBe('2026-12-25')
    expect(nextFixedDate('05-20', new Date(2026, 9, 22))).toBe('2027-05-20')
    expect(nextFixedDate(undefined)).toBe('')
  })
})

describe('informations obligatoires', () => {
  const base = { name: 'Gala', display: 'Gala', organizer: '', logo: null, date: '2027-01-10', timeStart: '18:00', venueAddr: 'Akwa · Douala' }
  const type = (id) => EVENT_TYPES.find((t) => t.id === id)

  it("n'exigent le logo et l'organisateur que pour les organisations", () => {
    expect(infoErrors(base, type('mariage'))).toEqual({})
    expect(Object.keys(infoErrors(base, type('conference')))).toEqual(['organizer', 'logo'])
  })

  it('signalent les champs vides dans leur ordre', () => {
    const errors = infoErrors({ ...base, name: ' ', date: '', venueAddr: '' }, type('mariage'))
    expect(Object.keys(errors)).toEqual(['name', 'date', 'venueAddr'])
  })

  it('requires a valid age for birthdays and wedding anniversaries only', () => {
    expect(infoErrors(base, type('anniversaire')).birthdayAge).toBeTruthy()
    expect(infoErrors({ ...base, birthdayAge: '30' }, type('anniversaire'))).toEqual({})
    expect(infoErrors({ ...base, birthdayAge: '30.5' }, type('anniversaire')).birthdayAge).toBeTruthy()
    expect(infoErrors(base, type('noces')).birthdayAge).toBeTruthy()
    expect(infoErrors({ ...base, birthdayAge: '10' }, type('noces'))).toEqual({})
    expect(infoErrors(base, type('mariage'))).toEqual({})
  })
})
