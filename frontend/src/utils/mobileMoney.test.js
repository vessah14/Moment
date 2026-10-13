import { describe, expect, it } from 'vitest'
import { isInviteCode, operatorStyle, usableAccounts, usableColors } from './mobileMoney'

describe('usableAccounts', () => {
  it('keeps only accounts with a real phone number', () => {
    const accounts = [
      { operator: 'Orange Money', number: '6 99 00 00 00' },
      { operator: 'Wave', number: '' },
      { operator: 'MTN MoMo', number: '12' },
      null,
    ]
    expect(usableAccounts(accounts)).toHaveLength(1)
    expect(usableAccounts(undefined)).toEqual([])
  })
})

describe('usableColors', () => {
  it('drops invalid colours (they end up in a style attribute)', () => {
    const colors = [{ hex: '#E8B4B8', name: 'Rose' }, { hex: 'red;background:url(x)' }, { hex: '#fff' }]
    expect(usableColors(colors)).toEqual([{ hex: '#E8B4B8', name: 'Rose' }])
  })
})

describe('operatorStyle', () => {
  it('falls back to a neutral badge for unknown operators', () => {
    expect(operatorStyle('Orange Money').short).toBe('OM')
    expect(operatorStyle('Inconnu').short).toBe(operatorStyle('Autre').short)
  })
})

describe('isInviteCode', () => {
  it('accepts only guest identifiers', () => {
    expect(isInviteCode('b856965d-ea29-4b76-adda-531078547945')).toBe(true)
    expect(isInviteCode('Fatou')).toBe(false)
    expect(isInviteCode('../../admin')).toBe(false)
    expect(isInviteCode(null)).toBe(false)
  })
})
