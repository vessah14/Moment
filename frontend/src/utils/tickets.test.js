import { describe, expect, it } from 'vitest'
import { TEMPLATES } from '../data/templates'
import { buildCardSheetPdf, cardSheetLayout, clean } from './ticketPrint'
import { TICKET_STYLES, defaultTicketStyle, resolveTicketStyle, ticketCode, ticketFormat, ticketFromCustomFields } from './ticketStyles'

describe('modèles de billets', () => {
  it('propose les 10 modèles du prototype', () => {
    expect(TICKET_STYLES.map((s) => s.id).sort()).toEqual(['badge', 'classique', 'concert', 'fairepart', 'minimal', 'or', 'pagne', 'polaroid', 'sobre', 'stade'])
  })

  it('conseille un billet pour chaque modèle de site premium', () => {
    for (const t of TEMPLATES.filter((x) => x.theme)) {
      expect(TICKET_STYLES.some((s) => s.id === defaultTicketStyle(t.theme))).toBe(true)
    }
    expect(defaultTicketStyle('toghu')).toBe('pagne')
    expect(defaultTicketStyle('memoire')).toBe('sobre')
    expect(defaultTicketStyle('inconnu')).toBe('classique')
  })

  it("sépare cartes d'invitation, billets d'entrée et badges", () => {
    expect(['classique', 'or', 'fairepart', 'pagne', 'polaroid', 'sobre'].map((s) => ticketFormat(s))).toEqual(Array(6).fill('carte'))
    expect(['concert', 'stade', 'minimal'].map((s) => ticketFormat(s))).toEqual(['billet', 'billet', 'billet'])
    expect(ticketFormat('badge')).toBe('badge')
  })

  it("donne toujours un billet d'entrée à un acheteur de la billetterie", () => {
    expect(ticketFormat('fairepart', true)).toBe('billet')
    expect(ticketFormat('badge', true)).toBe('badge')
  })

  it("garde le choix de l'organisateur et ignore un modèle inconnu", () => {
    expect(resolveTicketStyle('concert', 'toghu')).toBe('concert')
    expect(resolveTicketStyle('pirate', 'toghu')).toBe('pagne')
    expect(ticketFromCustomFields('{"ticket":{"style":"badge","note":"Tenue blanche"}}')).toEqual({ style: 'badge', note: 'Tenue blanche' })
    expect(ticketFromCustomFields('pas du json')).toEqual({ style: null, note: '' })
  })

  it("affiche un code court tiré de l'identifiant de l'invité", () => {
    expect(ticketCode('3f9a2c71-0000-4000-8000-000000000000')).toBe('3F9A2C71')
  })

  it('remplace les signes que les polices du PDF ne connaissent pas', () => {
    expect(clean('Dot – Mireille’s “fête”…')).toBe('Dot - Mireille\'s "fête"...')
  })
})

// Carte capturée (simulée) : une petite image JPEG aux proportions d'une carte ou d'un billet.
const JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCfAVo3/9k='
const shot = (width, height) => ({ width, height, toDataURL: () => JPEG })

describe('planches A4 de l’organisateur', () => {
  it('pose les cartes verticales sur A4 paysage et les billets sur A4 portrait', () => {
    expect(cardSheetLayout(true, 'a4')).toMatchObject({ orientation: 'landscape', cols: 3, rows: 1 })
    expect(cardSheetLayout(true, 'a5')).toMatchObject({ orientation: 'landscape', cols: 2, rows: 1 })
    expect(cardSheetLayout(false, 'a4')).toMatchObject({ orientation: 'portrait', cols: 1, rows: 3 })
    expect(cardSheetLayout(false, 'a5')).toMatchObject({ orientation: 'portrait', cols: 1, rows: 2 })
  })

  it('met 3 cartes par feuille, ou 2 en grand format', async () => {
    const cards = Array.from({ length: 7 }, () => shot(380, 900))
    const sheet = await buildCardSheetPdf(cards, 'a4')
    expect(sheet.getNumberOfPages()).toBe(3)
    expect(sheet.internal.pageSize.getWidth()).toBeCloseTo(297)
    expect((await buildCardSheetPdf(cards, 'a5')).getNumberOfPages()).toBe(4)
  })

  it('imprime les billets d’entrée en A4 portrait', async () => {
    const sheet = await buildCardSheetPdf([shot(760, 360), shot(760, 360)], 'a4')
    expect(sheet.getNumberOfPages()).toBe(1)
    expect(sheet.internal.pageSize.getWidth()).toBeCloseTo(210)
  })
})
