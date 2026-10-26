import QRCode from 'qrcode'

const GUEST_ID_PATTERN = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i

export function normalizeGuestTicketId(guestId) {
  const id = String(guestId ?? '').trim()
  if (!GUEST_ID_PATTERN.test(id)) {
    throw new Error('Identifiant de billet invalide.')
  }
  return id.toLowerCase()
}

export function createGuestTicketQr(guestId) {
  const id = normalizeGuestTicketId(guestId)
  return QRCode.toDataURL(id, {
    margin: 1,
    width: 360,
    errorCorrectionLevel: 'M',
  })
}
