import { describe, expect, it } from 'vitest'
import { builderSnapshot, clearBuilderDraft, readBuilderDraft, writeBuilderDraft } from './builderDraft'

function memoryStorage() {
  const data = new Map()
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: (k) => data.delete(k) }
}

describe('builder draft', () => {
  it('gives the same snapshot whatever the key order', () => {
    const a = builderSnapshot({ heroStyle: { title: 'Dot', color: '#fff' }, pageBlocks: ['RSVP'], blockContent: {}, customFields: '{}' })
    const b = builderSnapshot({ heroStyle: { color: '#fff', title: 'Dot' }, pageBlocks: ['RSVP'], blockContent: {}, customFields: '{}' })
    expect(a).toBe(b)
    expect(builderSnapshot({ heroStyle: { color: '#000', title: 'Dot' }, pageBlocks: ['RSVP'], blockContent: {}, customFields: '{}' })).not.toBe(a)
  })

  it('keeps one draft per event until it is cleared', () => {
    const s = memoryStorage()
    writeBuilderDraft('evt', 'snap', s)
    expect(readBuilderDraft('evt', s)).toMatchObject({ snapshot: 'snap' })
    expect(readBuilderDraft('other', s)).toBeNull()
    clearBuilderDraft('evt', s)
    expect(readBuilderDraft('evt', s)).toBeNull()
  })
})
