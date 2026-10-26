import { describe, expect, it } from 'vitest'
import {
  guestInvitationUrl,
  guestsForAudience,
  personalizeMessage,
} from './invitationMessage'

const guests = [
  { id: 'a', fullName: 'Awa Fall', status: 'Present' },
  { id: 'b', fullName: 'Moussa Diop', status: 'EnAttente' },
  { id: 'c', fullName: 'Fatou Ba', status: 'Absent' },
]

describe('invitation message helpers', () => {
  it('filters audiences using RSVP status', () => {
    expect(guestsForAudience(guests, 'Confirmés').map(guest => guest.id)).toEqual(['a'])
    expect(guestsForAudience(guests, 'En attente').map(guest => guest.id)).toEqual(['b'])
    expect(guestsForAudience(guests, 'Refus').map(guest => guest.id)).toEqual(['c'])
    expect(guestsForAudience(guests, 'Tous les invités')).toEqual(guests)
  })

  it('uses the event slug to build a personal invitation URL', () => {
    expect(guestInvitationUrl(guests[0], { slug: 'journee-famille' }, 'https://moment.test'))
      .toBe('https://moment.test/e/journee-famille?invite=a')
  })

  it('personalizes supported placeholders and supplies a date fallback', () => {
    expect(personalizeMessage(
      'Bonjour {prénom} {nom}, {date}, {lieu} {lien}',
      guests[0],
      { slug: 'journee-famille' },
      'https://moment.test',
    )).toBe('Bonjour Awa Fall, la date à confirmer, lieu à préciser https://moment.test/e/journee-famille?invite=a')
  })
})
