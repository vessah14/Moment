import { describe, expect, it } from 'vitest'
import { ILLUS } from '../utils/illus'
import { invitationGreeting, invitationParagraphs, invitationWords } from '../utils/invitationText'
import { INVITATIONS, invitationStarter } from './invitations'
import { TEMPLATES } from './templates'

describe('section Invitation', () => {
  it('existe pour les 27 modèles premium, avec démo et texte de départ', () => {
    const premium = TEMPLATES.filter((t) => t.premium)
    expect(premium).toHaveLength(27)
    for (const t of premium) {
      const inv = INVITATIONS[t.theme]
      expect(inv, t.theme).toBeTruthy()
      expect(inv.demo.body.length, t.theme).toBeGreaterThan(20)
      expect(inv.starter.body.length, t.theme).toBeGreaterThan(20)
    }
  })

  it('a une illustration qui existe et un cadre connu', () => {
    for (const [theme, inv] of Object.entries(INVITATIONS)) {
      expect(ILLUS.list, theme).toContain(inv.illus)
      expect(['arch', 'round', 'circle', 'rect'], theme).toContain(inv.frame)
      expect(ILLUS.svg(inv.illus), theme).toMatch(/^<svg viewBox="0 0 800 600"/)
    }
    expect(ILLUS.list).toHaveLength(23)
  })

  it('ouvre chaque modèle, juste après le Hero', () => {
    for (const t of TEMPLATES) expect(t.blocks[0], t.name).toBe('Invitation')
    for (const t of TEMPLATES) expect(t.blocks.filter((b) => b === 'Invitation'), t.name).toHaveLength(1)
  })

  it('part d’un texte sans noms d’exemple, signé du nom affiché', () => {
    const noor = TEMPLATES.find((t) => t.theme === 'noor')
    const content = invitationStarter(noor, 'Rosine & Arnaud')
    expect(content.signature).toBe('Rosine & Arnaud')
    expect(content.body).not.toMatch(/Awa|Ibrahim|six années/)
    expect(invitationStarter({ name: 'Éclat' }, 'Gala').body).toMatch(/présence/)
  })

  it('salue l’invité par son prénom sur son lien personnel', () => {
    const content = { greeting: 'Chers amis,', prefix: 'Coucou' }
    expect(invitationGreeting(content, 'Awa')).toBe('Coucou Awa,')
    expect(invitationGreeting({ greeting: 'Chers amis,' }, 'Awa')).toBe('Cher·e Awa,')
    expect(invitationGreeting(content, '')).toBe('Chers amis,')
  })

  it('découpe les paragraphes et numérote les mots à la suite', () => {
    const paragraphs = invitationParagraphs('Un deux.\n\n  Trois  quatre. \n\n\n')
    expect(paragraphs).toEqual(['Un deux.', 'Trois  quatre.'])
    expect(invitationWords(paragraphs).flat().map((w) => w.index)).toEqual([0, 1, 2, 3])
  })
})
