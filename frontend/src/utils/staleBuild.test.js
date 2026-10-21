import { describe, expect, it } from 'vitest'
import { isStaleBuildError } from './staleBuild'

describe('isStaleBuildError', () => {
  it('reconnaît un fichier de page d’une ancienne version', () => {
    expect(isStaleBuildError(new TypeError('Failed to fetch dynamically imported module: https://tbfmoment.com/assets/Pricing-abc.js'))).toBe(true)
    expect(isStaleBuildError(new TypeError('Importing a module script failed.'))).toBe(true)
    expect(isStaleBuildError(new Error('Unable to preload CSS for /assets/x.css'))).toBe(true)
  })

  it('ignore les autres erreurs', () => {
    expect(isStaleBuildError(new TypeError("Cannot read properties of undefined (reading 'name')"))).toBe(false)
    expect(isStaleBuildError(null)).toBe(false)
  })
})
