import { describe, expect, it } from 'vitest'
import { eventStartIso, ticketLiveState } from './ticketLive'

const START = '2027-01-16T10:00:00'
const at = (iso) => new Date(iso).getTime()

describe('billet vivant', () => {
  it('compte les jours, heures, minutes et secondes avant le début', () => {
    expect(ticketLiveState({ start: START }, at('2027-01-14T08:58:30'))).toEqual({ kind: 'before', days: 2, hours: 1, minutes: 1, seconds: 30 })
  })

  it("passe au jour J dès minuit, puis signale que c'est maintenant", () => {
    expect(ticketLiveState({ start: START }, at('2027-01-16T07:45:00'))).toMatchObject({ kind: 'today', started: false, minutes: 135 })
    expect(ticketLiveState({ start: START }, at('2027-01-16T10:05:00'))).toMatchObject({ kind: 'today', started: true })
  })

  it("se termine à la fin indiquée, sinon 8 h après le début", () => {
    expect(ticketLiveState({ start: START }, at('2027-01-16T18:30:00')).kind).toBe('past')
    expect(ticketLiveState({ start: START, end: '2027-01-16T23:00:00' }, at('2027-01-16T18:30:00')).kind).toBe('today')
  })

  it("affiche l'entrée dès que l'invité a été scanné", () => {
    const state = ticketLiveState({ start: START, checkedInAt: '2027-01-16T10:22:00' }, at('2027-01-16T10:25:00'))
    expect(state.kind).toBe('in')
    expect(state.at.getMinutes()).toBe(22)
  })

  it("se tait sans date d'événement", () => {
    expect(ticketLiveState({})).toBeNull()
    expect(eventStartIso(null, '10:00:00')).toBeNull()
    expect(eventStartIso('2027-01-16', '10:00:00')).toBe(START)
    expect(eventStartIso('2027-01-16')).toBe('2027-01-16T00:00:00')
  })
})
