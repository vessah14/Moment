import { describe, expect, it } from 'vitest'
import { applyCountryCode, detectCountry, searchCountries } from './phoneCountry'

describe('detectCountry', () => {
  it('returns null for an empty phone number', () => {
    expect(detectCountry('')).toBeNull()
    expect(detectCountry(null)).toBeNull()
  })

  it('detects the Senegal calling code', () => {
    expect(detectCountry('+221770000000')?.iso).toBe('SN')
  })

  it('prefers the longest matching calling code', () => {
    // +971 (Émirats) partage un préfixe "9" avec d'autres indicatifs plus courts —
    // on vérifie que le code le plus long et le plus spécifique gagne.
    expect(detectCountry('+971501234567')?.iso).toBe('AE')
  })

  it('returns null when no calling code matches', () => {
    expect(detectCountry('+999999')).toBeNull()
  })
})

describe('searchCountries', () => {
  it('returns the full list for an empty query', () => {
    expect(searchCountries('').length).toBeGreaterThan(0)
  })

  it('filters by country name', () => {
    const results = searchCountries('sénégal')
    expect(results.some((c) => c.iso === 'SN')).toBe(true)
  })

  it('filters by ISO code', () => {
    const results = searchCountries('sn')
    expect(results.some((c) => c.iso === 'SN')).toBe(true)
  })
})

describe('applyCountryCode', () => {
  it('prefixes a phone number with the new calling code', () => {
    const senegal = { code: '221', iso: 'SN', name: 'Sénégal' }
    expect(applyCountryCode('', senegal)).toBe('+221 ')
  })

  it('replaces an existing calling code rather than stacking it', () => {
    const france = { code: '33', iso: 'FR', name: 'France' }
    expect(applyCountryCode('+221 770000000', france)).toBe('+33 770000000')
  })
})
