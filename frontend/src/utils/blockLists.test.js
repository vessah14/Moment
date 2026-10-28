import { describe, expect, it } from 'vitest'
import { initialsOf, usableHonours, usablePartners, usablePeople, usableVenues } from './blockLists'

describe('usableHonours', () => {
  it('keeps named people with a known medal rank, gold by default', () => {
    expect(
      usableHonours([
        { name: ' Jeanne Ekotto ', role: 'Finances', topic: "Médaille d'or", rank: 2 },
        { name: 'Paul Mbida', rank: 7 },
        { name: '', rank: 1 },
      ]),
    ).toEqual([
      { name: 'Jeanne Ekotto', role: 'Finances', topic: "Médaille d'or", rank: 2 },
      { name: 'Paul Mbida', role: '', topic: '', rank: 0 },
    ])
    expect(usableHonours(null)).toEqual([])
  })
})

describe('usablePeople', () => {
  it('keeps only named people, as trimmed strings', () => {
    expect(
      usablePeople([
        { name: '  Kémi Ndjock ', role: "Tête d'affiche" },
        { name: '', role: 'Sans nom' },
        { name: { evil: true } },
        null,
      ]),
    ).toEqual([{ name: 'Kémi Ndjock', role: "Tête d'affiche", topic: '' }])
  })

  it('tolerates missing data', () => {
    expect(usablePeople(undefined)).toEqual([])
    expect(usablePeople('oops')).toEqual([])
  })
})

describe('usablePartners', () => {
  it('keeps non-empty names', () => {
    expect(usablePartners(['Wouri Digital', ' ', 42, { name: 'Radio FM' }])).toEqual(['Wouri Digital', 'Radio FM'])
  })
})

describe('usableVenues', () => {
  it('keeps usable venue details and rejects malformed entries', () => {
    expect(
      usableVenues([
        { label: ' Cérémonie ', address: ' Paroisse Saint-Jean ', time: ' 10 h – 14 h ' },
        { address: 42, label: null },
        null,
      ]),
    ).toEqual([{ label: 'Cérémonie', address: 'Paroisse Saint-Jean', time: '10 h – 14 h' }])
  })

  it('caps the list at four locations', () => {
    expect(usableVenues(Array.from({ length: 6 }, (_, i) => ({ address: `Lieu ${i}` })))).toHaveLength(4)
  })
})

describe('initialsOf', () => {
  it('skips titles such as Dr. or Pr.', () => {
    expect(initialsOf('Dr. Aline Mbappé')).toBe('AM')
    expect(initialsOf('Pr. Atangana')).toBe('A')
    expect(initialsOf('DJ Bonaberi')).toBe('DB')
  })
})
