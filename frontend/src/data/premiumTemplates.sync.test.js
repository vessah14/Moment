import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { TEMPLATES } from './templates'

// Le serveur refuse un modèle premium aux offres qui ne l'incluent pas : sa liste
// (backend/.../Services/PremiumTemplates.cs) doit rester celle des modèles à thème du site.
describe('modèles premium côté serveur', () => {
  it('liste les mêmes noms que le site', () => {
    const cs = readFileSync(
      new URL('../../../backend/src/backend_EventMoment/Services/PremiumTemplates.cs', import.meta.url),
      'utf8',
    )
    const block = cs.slice(cs.indexOf('Names = new'), cs.indexOf('};'))
    const server = [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort()
    const site = TEMPLATES.filter((t) => t.theme).map((t) => t.name).sort()
    expect(server).toEqual(site)
  })

  it('affichent le badge Premium, et eux seuls', () => {
    for (const t of TEMPLATES) expect(t.badge, t.name).toBe(t.theme ? 'PREMIUM' : 'GRATUIT')
  })
})
