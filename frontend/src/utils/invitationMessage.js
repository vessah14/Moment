export function guestsForAudience(guests, audience) {
  const statuses = {
    Confirmés: 'Present',
    'En attente': 'EnAttente',
    Refus: 'Absent',
  }
  const expectedStatus = statuses[audience]
  return expectedStatus
    ? guests.filter(guest => guest.status === expectedStatus)
    : guests
}

export function guestInvitationUrl(guest, event, origin) {
  if (!guest) return ''
  const base = event?.slug
    ? `${origin}/e/${encodeURIComponent(event.slug)}?invite=${encodeURIComponent(guest.id)}`
    : `${origin}/invitation/${encodeURIComponent(guest.id)}`
  return base
}

export function personalizeMessage(template, guest, event, origin) {
  const [firstName = '', ...lastName] = (guest?.fullName ?? '').split(' ')
  const dateValue = event?.eventDate
    ? String(event.eventDate).slice(0, 10)
    : ''
  const date = event?.eventDate
    ? new Date(`${dateValue}T12:00:00`).toLocaleDateString('fr-FR')
    : 'la date à confirmer'
  const values = {
    '{prénom}': firstName,
    '{nom}': lastName.join(' '),
    '{date}': date,
    '{lieu}': event?.location || 'lieu à préciser',
    '{lien}': guestInvitationUrl(guest, event, origin),
  }

  return Object.entries(values).reduce(
    (text, [token, value]) => text.replaceAll(token, value),
    template,
  )
}
