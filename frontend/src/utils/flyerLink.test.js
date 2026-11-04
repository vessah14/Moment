import { describe, expect, it } from 'vitest'
import { flyerLink } from './flyerLink'

const now = new Date('2027-03-01T12:00:00').getTime()
const params = (href) => Object.fromEntries(new URL(href, 'https://x').searchParams)

describe('lien vers le studio de flyers', () => {
  it("propose un compte à rebours avant un anniversaire, puis le flyer de vœux", () => {
    const base = { type: 'anniversaire', title: 'Les 30 ans de Manuella', displayName: 'Manuella', slug: 'manuella-30', age: 30, now }
    const before = flyerLink({ ...base, start: new Date('2027-03-11T12:00:00') })
    expect(before.label).toBe("Créer un flyer d'annonce")
    expect(params(before.href)).toMatchObject({ occ: 'compte', num: '10', nom: 'Manuella', sous: 'Les 30 ans de Manuella' })

    const after = flyerLink({ ...base, start: new Date('2027-02-20T20:00:00') })
    expect(after.label).toBe('Faire un flyer pour Manuella')
    expect(params(after.href)).toMatchObject({ occ: 'anniversaire', num: '30' })
  })

  it("fait une affiche de concert avec la date et le lieu", () => {
    const link = flyerLink({ type: 'concert', title: 'Douala Live Sessions', start: new Date('2027-03-13T20:00:00'), venueName: 'Esplanade', venueAddress: 'Bonanjo, Douala', slug: 'dls', now })
    expect(params(link.href)).toMatchObject({ occ: 'concert', nom: 'Douala Live Sessions', lieu: 'Esplanade, Douala' })
    expect(params(link.href).quand).toMatch(/^Samedi 13 mars · 20h00$/)
  })

  it("propose l'hommage après des obsèques et les mariés après un mariage", () => {
    expect(flyerLink({ type: 'obseques', title: 'Papa', start: new Date('2027-02-01'), slug: 'p', now }).label).toBe("Faire un flyer d'hommage")
    expect(flyerLink({ type: 'mariage', title: 'Mariage', displayName: 'Grâce & Junior', start: new Date('2027-02-01'), slug: 'g', now }).label).toBe('Faire un flyer pour les mariés')
  })

  it("ne transmet qu'une image comme couverture", () => {
    const base = { type: 'anniversaire', title: 'X', start: new Date('2027-02-01'), slug: 'x', now }
    expect(params(flyerLink({ ...base, cover: '/uploads/covers/a.jpg' }).href).cover).toBe('/uploads/covers/a.jpg')
    expect(params(flyerLink({ ...base, cover: 'javascript:alert(1)' }).href).cover).toBeUndefined()
    expect(flyerLink({ ...base, slug: '' })).toBeNull()
  })
})
