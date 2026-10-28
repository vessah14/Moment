import { describe, expect, it } from 'vitest'
import { guestRowsFromSheet, maskPhone, parseCsv } from './guestImport'

describe('guestRowsFromSheet', () => {
  it('reads the columns from the header row, in any order and with accents', () => {
    expect(
      guestRowsFromSheet([
        ['Liste du personnel 2027'],
        ['Téléphone', 'Nom et prénom', 'Service'],
        [677123456, '  Paul   Ekané ', 'Commercial'],
        ['', 'Aïcha Bello', 'Finances'],
        ['699000000', '', 'Technique'],
      ]),
    ).toEqual([
      { fullName: 'Paul Ekané', service: 'Commercial', phone: '677123456' },
      { fullName: 'Aïcha Bello', service: 'Finances', phone: '' },
    ])
  })

  it('falls back to name, service, phone without a header', () => {
    expect(guestRowsFromSheet([['Marie Ngo', 'Commercial', '+237 699 00 00 08']])).toEqual([
      { fullName: 'Marie Ngo', service: 'Commercial', phone: '+237 699 00 00 08' },
    ])
    expect(guestRowsFromSheet(null)).toEqual([])
  })
})

describe('parseCsv', () => {
  it('handles semicolons, quotes and CRLF', () => {
    expect(parseCsv('﻿nom;service;téléphone\r\n"Ekané; Paul";Commercial;677\r\nMarie "M" Ngo;RH;699\n')).toEqual([
      ['nom', 'service', 'téléphone'],
      ['Ekané; Paul', 'Commercial', '677'],
      ['Marie "M" Ngo', 'RH', '699'],
    ])
    expect(parseCsv('name,phone\nPaul,677')).toEqual([['name', 'phone'], ['Paul', '677']])
  })
})

describe('maskPhone', () => {
  it('keeps the first three and last two digits of the national number', () => {
    expect(maskPhone('+237 677 12 34 56')).toBe('677 •• •• 56')
    expect(maskPhone('699000008')).toBe('699 •• •• 08')
    expect(maskPhone('')).toBe('')
    expect(maskPhone('123')).toBe('123')
  })
})
