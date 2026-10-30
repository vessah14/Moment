import { describe, expect, it } from 'vitest'
import { buildShareMessage, whatsappShareUrl } from './shareMessage'

describe('share message', () => {
  it('formats an invitation with title, date with time, place and link', () => {
    const message = buildShareMessage({
      title: 'Dot de Brenda et Paul',
      date: '2026-12-19',
      time: '14:30:00',
      location: 'Salle des fêtes de Bafoussam',
      url: 'https://tbfmoment.com/e/dot-brenda',
    })
    expect(message).toBe([
      '✨ *Vous êtes invité·e !*',
      '',
      '🎉 *Dot de Brenda et Paul*',
      '',
      '📅 Samedi 19 décembre 2026 à 14h30',
      '📍 Salle des fêtes de Bafoussam',
      '',
      '👉 Toutes les infos et votre réponse :',
      'https://tbfmoment.com/e/dot-brenda',
    ].join('\n'))
  })

  it('starts with the event type sentence when there is one', () => {
    expect(buildShareMessage({ title: 'Wouri Logistics', url: 'https://x.test/e/w', intro: 'Vous êtes invité·e à la cérémonie de présentation des vœux de' }))
      .toBe('✨ *Vous êtes invité·e à la cérémonie de présentation des vœux de Wouri Logistics.*\n\n👉 Toutes les infos et votre réponse :\nhttps://x.test/e/w')
  })

  it('skips missing date and place', () => {
    expect(buildShareMessage({ title: 'Fête', url: 'https://x.test/e/f' }))
      .toBe('✨ *Vous êtes invité·e !*\n\n🎉 *Fête*\n\n👉 Toutes les infos et votre réponse :\nhttps://x.test/e/f')
  })

  it('asks to answer before the RSVP deadline', () => {
    expect(buildShareMessage({ title: 'Fête', url: 'https://x.test/e/f', deadline: '2026-12-01' }))
      .toBe('✨ *Vous êtes invité·e !*\n\n🎉 *Fête*\n\n⏳ Merci de répondre avant le 1 décembre 2026\n\n👉 Toutes les infos et votre réponse :\nhttps://x.test/e/f')
  })

  it('keeps the WhatsApp bold intact when the title contains an asterisk', () => {
    expect(buildShareMessage({ title: 'Gala *VIP*', url: 'https://x.test/e/g' })).toContain('🎉 *Gala VIP*')
  })

  it('encodes the WhatsApp link', () => {
    expect(whatsappShareUrl('a & b')).toBe('https://wa.me/?text=a%20%26%20b')
  })
})
