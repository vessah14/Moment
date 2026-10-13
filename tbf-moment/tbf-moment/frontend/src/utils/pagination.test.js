import { describe, expect, it } from 'vitest'
import { pageWindow, paginate } from './pagination'

const items = Array.from({ length: 57 }, (_, i) => i + 1)

describe('paginate', () => {
  it('returns the requested slice and its bounds', () => {
    expect(paginate(items, 1, 25)).toMatchObject({ page: 1, pageCount: 3, total: 57, from: 1, to: 25 })
    const last = paginate(items, 3, 25)
    expect(last).toMatchObject({ from: 51, to: 57 })
    expect(last.items).toEqual([51, 52, 53, 54, 55, 56, 57])
  })

  it('clamps an out-of-range page (list shrank after a filter or a delete)', () => {
    expect(paginate(items, 9, 25).page).toBe(3)
    expect(paginate(items, 0, 25).page).toBe(1)
    expect(paginate([], 4, 25)).toMatchObject({ page: 1, pageCount: 1, from: 0, to: 0, items: [] })
  })
})

describe('pageWindow', () => {
  it('lists every page when there are few', () => {
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('keeps the ends and the neighbours of the current page', () => {
    expect(pageWindow(6, 12)).toEqual([1, '…', 5, 6, 7, '…', 12])
    expect(pageWindow(1, 12)).toEqual([1, 2, 3, 4, '…', 12])
    expect(pageWindow(12, 12)).toEqual([1, '…', 9, 10, 11, 12])
  })
})
