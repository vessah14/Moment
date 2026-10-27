// Envoi des invitations une par une sur WhatsApp ou par SMS, depuis le téléphone de
// l'organisateur : le lien ouvre directement la discussion de l'invité quand son numéro
// est connu, et l'invité suivant s'affiche aussitôt.
const DEFAULT_COUNTRY = '237'

// Numéro au format international sans « + » (ex. 237690000000), ou null.
// Un numéro local camerounais à 9 chiffres (6…, 2…) reçoit l'indicatif 237.
export function internationalNumber(phone) {
  let digits = String(phone ?? '').replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) digits = digits.slice(1)
  else if (digits.startsWith('00')) digits = digits.slice(2)
  else if (/^[62]\d{8}$/.test(digits)) digits = DEFAULT_COUNTRY + digits
  digits = digits.replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 15 ? digits : null
}

export function guestMessageUrl(channel, phone, text) {
  const number = internationalNumber(phone)
  if (channel === 'SMS') return number ? `sms:+${number}?body=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${number ?? ''}?text=${encodeURIComponent(text)}`
}

// Invités déjà contactés, par événement et par canal, gardés sur cet appareil.
const sentKey = (eventId, channel) => `tbf_sent_${channel}_${eventId}`

export function readSent(eventId, channel, storage = globalThis.localStorage) {
  try {
    const ids = JSON.parse(storage?.getItem(sentKey(eventId, channel)) ?? '[]')
    return new Set(Array.isArray(ids) ? ids : [])
  } catch {
    return new Set()
  }
}

export function writeSent(eventId, channel, ids, storage = globalThis.localStorage) {
  try {
    if (ids.size) storage?.setItem(sentKey(eventId, channel), JSON.stringify([...ids]))
    else storage?.removeItem(sentKey(eventId, channel))
  } catch {
    // Stockage indisponible : la progression n'est pas gardée.
  }
}

// Prochain invité pas encore contacté après `currentId` (en reprenant au début).
export function nextUnsent(guests, sent, currentId) {
  const start = guests.findIndex((g) => g.id === currentId)
  const ordered = [...guests.slice(start + 1), ...guests.slice(0, Math.max(start, 0))]
  return ordered.find((g) => !sent.has(g.id)) ?? null
}
