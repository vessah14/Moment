import { describe, expect, it } from 'vitest'
import { buildIcs, googleCalendarUrl } from './calendar'

const start = new Date('2026-12-19T13:30:00Z')

describe('calendar', () => {
  it('builds a 4-hour Google Calendar link', () => {
    expect(googleCalendarUrl({ title: 'Dot', start, location: 'Bafoussam' })).toBe(
      'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Dot&dates=20261219T133000Z/20261219T173000Z&location=Bafoussam',
    )
  })

  it('builds an .ics file with escaped text and a reminder the day before', () => {
    const ics = buildIcs({ title: 'Dot; Brenda, Paul', start, location: 'Salle, Bafoussam', url: 'https://tbfmoment.com/e/dot', uid: 'dot' })
    expect(ics).toContain('SUMMARY:Dot\\; Brenda\\, Paul')
    expect(ics).toContain('LOCATION:Salle\\, Bafoussam')
    expect(ics).toContain('DTSTART:20261219T133000Z')
    expect(ics).toContain('UID:dot@tbfmoment.com')
    expect(ics).toContain('TRIGGER:-P1D')
    expect(ics.split('\r\n')[0]).toBe('BEGIN:VCALENDAR')
  })
})
