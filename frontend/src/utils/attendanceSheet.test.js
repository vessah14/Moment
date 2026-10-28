import { describe, expect, it } from 'vitest'
import { arrivalTime, attendanceRows } from './attendanceSheet'

describe('attendanceRows', () => {
  it('lists expected guests alphabetically with Douala arrival time and cocktail', () => {
    expect(
      attendanceRows([
        { fullName: 'Paul Ekané', status: 'Present', side: 'Commercial', extra: true, checkedInAt: '2027-01-15T08:42:00Z' },
        { fullName: 'Aïcha Bello', status: 'Present', side: 'Finances', extra: false, checkedInAt: null },
        { fullName: 'Peter Nfor', status: 'Absent', checkedInAt: null },
        { fullName: 'Brenda Ayuk', status: 'EnAttente', checkedInAt: null },
      ]),
    ).toEqual([
      { name: 'Aïcha Bello', service: 'Finances', arrival: '', cocktail: 'Non' },
      { name: 'Brenda Ayuk', service: '', arrival: '', cocktail: '' },
      { name: 'Paul Ekané', service: 'Commercial', arrival: '09:42', cocktail: 'Oui' },
    ])
    expect(arrivalTime(null)).toBe('')
  })
})
