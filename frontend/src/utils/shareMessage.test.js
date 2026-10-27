import { describe, expect, it } from 'vitest'
import { buildShareMessage, whatsappShareUrl } from './shareMessage'

describe('share message', () => {
  it('lists title, date with time, place and link', () => {
    const message = buildShareMessage({
      title: 'Dot de Brenda et Paul',
      date: '2026-12-19',
      time: '14:30:00',
      location: 'Salle des fêtes de Bafoussam',
      url: 'https://tbfmoment.com/e/dot-brenda',
    })
    expect(message).toBe(
      'Dot de Brenda et Paul\n📅 Samedi 19 décembre 2026 à 14h30\n📍 Salle des fêtes de Bafoussam\n\nToutes les infos et votre réponse ici : https://tbfmoment.com/e/dot-brenda',
    )
  })

  it('skips missing date and place', () => {
    expect(buildShareMessage({ title: 'Fête', url: 'https://x.test/e/f' }))
      .toBe('Fête\n\nToutes les infos et votre réponse ici : https://x.test/e/f')
  })

  it('encodes the WhatsApp link', () => {
    expect(whatsappShareUrl('a & b')).toBe('https://wa.me/?text=a%20%26%20b')
  })
})
