export const CALLING_CODES = [
  { code: '221', iso: 'SN', name: 'Sénégal' },
  { code: '225', iso: 'CI', name: "Côte d'Ivoire" },
  { code: '223', iso: 'ML', name: 'Mali' },
  { code: '224', iso: 'GN', name: 'Guinée' },
  { code: '226', iso: 'BF', name: 'Burkina Faso' },
  { code: '227', iso: 'NE', name: 'Niger' },
  { code: '228', iso: 'TG', name: 'Togo' },
  { code: '229', iso: 'BJ', name: 'Bénin' },
  { code: '220', iso: 'GM', name: 'Gambie' },
  { code: '222', iso: 'MR', name: 'Mauritanie' },
  { code: '237', iso: 'CM', name: 'Cameroun' },
  { code: '234', iso: 'NG', name: 'Nigeria' },
  { code: '233', iso: 'GH', name: 'Ghana' },
  { code: '212', iso: 'MA', name: 'Maroc' },
  { code: '213', iso: 'DZ', name: 'Algérie' },
  { code: '216', iso: 'TN', name: 'Tunisie' },
  { code: '27', iso: 'ZA', name: 'Afrique du Sud' },
  { code: '33', iso: 'FR', name: 'France' },
  { code: '32', iso: 'BE', name: 'Belgique' },
  { code: '41', iso: 'CH', name: 'Suisse' },
  { code: '44', iso: 'GB', name: 'Royaume-Uni' },
  { code: '49', iso: 'DE', name: 'Allemagne' },
  { code: '34', iso: 'ES', name: 'Espagne' },
  { code: '39', iso: 'IT', name: 'Italie' },
  { code: '351', iso: 'PT', name: 'Portugal' },
  { code: '1', iso: 'US', name: 'États-Unis / Canada' },
  { code: '971', iso: 'AE', name: 'Émirats arabes unis' },
]

const BY_CODE_LENGTH = [...CALLING_CODES].sort(
  (a, b) => b.code.length - a.code.length,
)

const BY_NAME = [...CALLING_CODES].sort((a, b) => a.name.localeCompare(b.name, 'fr'))

export function detectCountry(phone) {
  const digits = (phone ?? '').replace(/[^\d]/g, '')
  if (!digits) return null
  return BY_CODE_LENGTH.find((c) => digits.startsWith(c.code)) ?? null
}

export function listCountries() {
  return BY_NAME
}

export function searchCountries(query) {
  const q = query.trim().toLowerCase()
  if (!q) return BY_NAME
  return BY_NAME.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.iso.toLowerCase() === q ||
      c.iso.toLowerCase().startsWith(q) ||
      c.code.startsWith(q.replace(/^\+/, '')),
  )
}

export function applyCountryCode(phone, country) {
  const current = detectCountry(phone)
  let rest = (phone ?? '').trim().replace(/^\+\s*/, '')
  if (current) rest = rest.slice(current.code.length).trim()
  return `+${country.code}${rest ? ` ${rest}` : ' '}`
}
