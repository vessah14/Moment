import { describe, expect, it } from 'vitest'
import { absoluteUrl, buildSeoTags, cleanDescription, DEFAULT_TITLE } from './seo'

const BASE = 'https://tbfmoment.com'
const meta = (tags, key) => tags.meta.find(([, k]) => k === key)?.[2]

describe('buildSeoTags', () => {
  it('builds a titled, indexable page with absolute share URLs', () => {
    const tags = buildSeoTags(
      { title: 'Tarifs', description: 'Nos offres.', path: '/tarifs' },
      BASE,
    )
    expect(tags.title).toBe('Tarifs · TBF Moment')
    expect(tags.canonical).toBe('https://tbfmoment.com/tarifs')
    expect(meta(tags, 'robots')).toMatch(/^index, follow/)
    expect(meta(tags, 'og:url')).toBe('https://tbfmoment.com/tarifs')
    expect(meta(tags, 'og:image')).toBe('https://tbfmoment.com/og-image.png')
    expect(meta(tags, 'twitter:card')).toBe('summary_large_image')
  })

  it('falls back to the default title and current path', () => {
    const tags = buildSeoTags({}, BASE, '/modeles')
    expect(tags.title).toBe(DEFAULT_TITLE)
    expect(tags.canonical).toBe('https://tbfmoment.com/modeles')
  })

  it('marks private pages as noindex', () => {
    expect(meta(buildSeoTags({ noindex: true }, BASE), 'robots')).toBe('noindex, nofollow')
  })

  it('keeps absolute image URLs untouched', () => {
    const tags = buildSeoTags({ image: 'https://cdn.example.com/a.jpg' }, BASE)
    expect(meta(tags, 'og:image')).toBe('https://cdn.example.com/a.jpg')
  })
})

describe('cleanDescription', () => {
  it('flattens whitespace and trims long text on a word boundary', () => {
    const text = 'Un  texte\nsur plusieurs lignes '.repeat(20)
    const result = cleanDescription(text)
    expect(result.length).toBeLessThanOrEqual(160)
    expect(result.endsWith('…')).toBe(true)
    expect(result).not.toMatch(/\n|\s{2}/)
  })
})

describe('absoluteUrl', () => {
  it('joins paths to the site URL', () => {
    expect(absoluteUrl('e/mon-mariage', BASE)).toBe('https://tbfmoment.com/e/mon-mariage')
    expect(absoluteUrl('/e/x', BASE)).toBe('https://tbfmoment.com/e/x')
  })
})
