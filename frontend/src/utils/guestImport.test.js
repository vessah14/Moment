import { describe, expect, it } from 'vitest'
import { contactRowsFromPicker, guestRowsFromSheet, maskPhone, parseCsv } from './guestImport'

describe('contactRowsFromPicker', () => {
  it('normalizes phone numbers, keeps emails and skips existing or repeated contacts', () => {
    const result = contactRowsFromPicker(
      [
        { name: ['Aïcha Bello'], tel: ['+237 6 90 00 00 01'], email: ['aicha@example.com'] },
        { name: ['Aïcha bis'], tel: ['690000001'] },
        { name: ['Paul Ekané'], tel: ['677 12 34 56'] },
        { name: ['Paul again'], tel: ['+237 677 12 34 56'] },
        { name: ['Sans téléphone'], email: [] },
        { name: [], tel: ['699 00 00 00'] },
      ],
      [{ fullName: 'Paul Ekané', phone: '+237677123456', email: '' }],
    )

    expect(result).toEqual({
      rows: [
        { fullName: 'Aïcha Bello', service: '', phone: '237690000001', email: 'aicha@example.com' },
        { fullName: 'Sans téléphone', service: '', phone: '', email: '' },
      ],
      skipped: 4,
    })
  })
})

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
