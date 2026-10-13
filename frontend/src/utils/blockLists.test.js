import { describe, expect, it } from 'vitest'
import { initialsOf, usablePartners, usablePeople } from './blockLists'

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

describe('initialsOf', () => {
  it('skips titles such as Dr. or Pr.', () => {
    expect(initialsOf('Dr. Aline Mbappé')).toBe('AM')
    expect(initialsOf('Pr. Atangana')).toBe('A')
    expect(initialsOf('DJ Bonaberi')).toBe('DB')
  })
})
