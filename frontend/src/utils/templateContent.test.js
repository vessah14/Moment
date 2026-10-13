import { describe, expect, it } from 'vitest'
import { TEMPLATES } from '../data/templates'
import {
  blockContentToSave,
  initialBlockContent,
  programItemsToCreate,
  templateContentBlocks,
  templateExample,
  ticketTypesToCreate,
} from './templateContent'
import { findTemplate } from './templateTheme'

describe('templateContentBlocks', () => {
  it('asks only for the sections each template shows', () => {
    expect(templateContentBlocks(findTemplate('Live'))).toEqual(['Intervenants', 'Programme', 'Billetterie', 'Partenaires', 'FAQ'])
    expect(templateContentBlocks(findTemplate('Mémoire'))).toEqual(['Histoire', 'Programme', 'Dress code', 'Cadeaux'])
    expect(templateContentBlocks(null)).toEqual([])
  })

  it('uses the template labels', () => {
    expect(initialBlockContent(findTemplate('Nuage'), 'Familles')).toMatchObject({
      heading: 'Parrain et marraine',
      a: { label: 'La marraine' },
      b: { label: 'Le parrain' },
    })
  })
})

describe('templateExample', () => {
  it('exists for every premium template and only fills its own sections', () => {
    for (const template of TEMPLATES.filter((t) => t.theme)) {
      const example = templateExample(template)
      expect(example, template.name).not.toBeNull()
      const allowed = new Set(templateContentBlocks(template))
      for (const type of Object.keys(example.blockContent)) expect(allowed.has(type), `${template.name} ${type}`).toBe(true)
    }
    expect(templateExample(findTemplate('Éclat'))).toBeNull()
  })

  it('maps the demo into wizard fields', () => {
    const live = templateExample(findTemplate('Live'))
    expect(live.blockContent.Intervenants.people[0]).toMatchObject({ name: 'Kémi Ndjock', role: "Tête d'affiche" })
    expect(live.programItems[0]).toEqual({ time: '19:00', title: 'Ouverture des portes', note: 'Bar et food-trucks' })
    expect(live.ticketTypes[0]).toEqual({ name: 'Fosse', price: '5000', quota: '1200' })
  })
})

describe('saving', () => {
  it('keeps only the known fields of a section', () => {
    expect(blockContentToSave('Histoire', { body: 'Texte', heading: 'x', evil: 1 })).toEqual({ body: 'Texte' })
    expect(blockContentToSave('Inconnu', { body: 'x' })).toEqual({})
  })

  it('builds program items and tickets for the API', () => {
    const [item] = programItemsToCreate([{ time: '19:00', title: ' Ouverture ', note: '' }, { title: '  ' }], '2027-02-13')
    expect(item).toMatchObject({ title: 'Ouverture', description: null, durationMinutes: 60, capacity: 50 })
    expect(new Date(item.startTime).getHours()).toBe(19)
    expect(programItemsToCreate([{ time: '19:00', title: 'Sans date' }], '')[0].startTime).toBeNull()
    expect(ticketTypesToCreate([{ name: 'Fosse', price: '5000', quota: '0' }, { name: '' }])).toEqual([
      { name: 'Fosse', priceCents: 500000, quota: 1 },
    ])
  })
})
