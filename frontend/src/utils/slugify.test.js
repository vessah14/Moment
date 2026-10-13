import { describe, expect, it } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('lowercases and hyphenates simple names', () => {
    expect(slugify('Mariage de Awa')).toBe('mariage-de-awa')
  })

  it('strips accents', () => {
    expect(slugify('Événement à Dakar')).toBe('evenement-a-dakar')
  })

  it('collapses non-alphanumeric runs into single hyphens', () => {
    expect(slugify('Foo!!  Bar--Baz')).toBe('foo-bar-baz')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  -Hello World-  ')).toBe('hello-world')
  })

  it('falls back to a default slug when nothing alphanumeric remains', () => {
    expect(slugify('!!!')).toBe('mon-evenement')
  })
})
