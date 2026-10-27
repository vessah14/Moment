import { describe, expect, it } from 'vitest'
import { mergeClasses } from './mergeClasses'

describe('mergeClasses', () => {
  it('lets p-0 remove the default horizontal and vertical padding', () => {
    expect(mergeClasses('inline-flex px-6 py-3 text-sm', 'h-10 w-10 p-0')).toBe('inline-flex text-sm h-10 w-10 p-0')
  })

  it('keeps defaults for prefixed overrides', () => {
    expect(mergeClasses('px-6 py-3', 'sm:px-2')).toBe('px-6 py-3 sm:px-2')
  })
})
