import { describe, expect, it } from 'vitest'
import { formatFcfa, invitationCost, planForGuests } from './invitationCost'

describe("calculateur du coût des invitations", () => {
  it("choisit l'offre qui suffit pour ce nombre d'invités", () => {
    expect(planForGuests(50)).toEqual({ name: 'Free', price: 0 })
    expect(planForGuests(51)).toEqual({ name: 'Premium', price: 5000 })
    expect(planForGuests(500).name).toBe('Premium')
    expect(planForGuests(1200)).toEqual({ name: 'Business', price: 15000 })
    expect(planForGuests(5000)).toEqual({ name: 'Event Pro', price: 30000 })
  })

  it('compare avec des cartons imprimés', () => {
    expect(invitationCost(200, 500)).toEqual({ paper: 100000, plan: { name: 'Premium', price: 5000 }, saving: 95000 })
    expect(invitationCost(100, 20).saving).toBe(0)
    expect(invitationCost(40, -3)).toMatchObject({ paper: 0, saving: 0 })
  })

  it('écrit les montants en FCFA', () => {
    expect(formatFcfa(100000)).toBe('100 000 FCFA')
  })
})
