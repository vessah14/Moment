import { describe, expect, it } from 'vitest'
import { TEMPLATE_DEMOS } from '../../../data/templateDemos'
import { TEMPLATES } from '../../../data/templates'
import { MOTIFS } from './motifs'
import { SITE_THEMES, themeMotif, themePalette } from './themeDefs'
import { monogramOf, parseTitle } from './titleParts'

describe('premium themes', () => {
  it('every premium template points to an existing theme', () => {
    const premium = TEMPLATES.filter((t) => t.theme)
    expect(premium.map((t) => t.name)).toEqual([
      'Noor', 'Bloom', 'Toghu Royal', 'Ndop', 'Fiesta', 'Prestige',
      'Arena', 'Live', 'Summit', 'Horizon', 'Nuage', 'Grâce', 'Campus', 'Toge', 'Mémoire', 'Racines', 'Velvet', 'Atelier', 'Libre',
    ])
    for (const t of premium) {
      expect(SITE_THEMES[t.theme]).toBeDefined()
      expect(TEMPLATE_DEMOS[t.theme]).toBeDefined()
    }
    expect(new Set(TEMPLATES.map((t) => t.name)).size).toBe(TEMPLATES.length)
  })

  it('every theme has complete palettes and known motifs', () => {
    const keys = ['--bg', '--surface', '--surface-2', '--fg', '--muted', '--accent', '--accent-2', '--on-accent', '--line', '--motif']
    for (const theme of Object.values(SITE_THEMES)) {
      expect(theme.palettes).toHaveLength(3)
      for (const p of theme.palettes) for (const k of keys) expect(p.vars[k]).toMatch(/^#[0-9A-Fa-f]{6}$/)
      for (const m of theme.motifs) expect(MOTIFS[m]).toBeDefined()
      // Certains modèles (Atelier, Campus, Mémoire, Velvet) n'ont pas de cadre dessiné.
      expect(theme.frame === '' || /^<svg /.test(theme.frame)).toBe(true)
      expect(theme.ornament).toMatch(/^<svg /)
    }
  })

  it('falls back to the first palette and motif', () => {
    const noor = SITE_THEMES.noor
    expect(themePalette(noor, 'inconnue').id).toBe('emeraude')
    expect(themePalette(noor, 'ivoire').id).toBe('ivoire')
    expect(themeMotif(noor, 'pois')).toBe('etoile')
  })
})

describe('parseTitle', () => {
  it('splits a couple into two names', () => {
    const info = parseTitle('Grâce & Junior', 'split')
    expect(info.names).toEqual(['Grâce', 'Junior'])
    expect(monogramOf(info)).toBe('G&J')
  })

  it('extracts the age for big headers', () => {
    const info = parseTitle('Les 30 ans de Manuella', 'big')
    expect(info).toMatchObject({ big: '30', pre: 'Les 30 ans de', names: ['Manuella'] })
    expect(monogramOf(info)).toBe('30')
  })

  it('splits a match on vs when the theme uses it', () => {
    const info = parseTitle('Wouri FC vs Kotto United', 'split', 'vs')
    expect(info).toMatchObject({ names: ['Wouri FC', 'Kotto United'], joiner: 'vs' })
    expect(parseTitle('Wouri FC vs Kotto United', 'split').names).toEqual(['Wouri FC vs Kotto United'])
  })

  it('keeps a plain title as is', () => {
    const info = parseTitle('Anniversaire vessah', 'big')
    expect(info).toMatchObject({ big: null, names: ['Anniversaire vessah'] })
    expect(monogramOf(info)).toBe('AV')
  })
})
