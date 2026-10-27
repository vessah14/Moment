import { describe, expect, it } from 'vitest'
import { PLAN_EVENT_LIMITS, PRICING_PLANS } from './pricingPlans'

describe('pricing plan event limits', () => {
  it('uses the server free and premium limits in the plan cards', () => {
    expect(PLAN_EVENT_LIMITS).toEqual({ free: 3, premium: 5 })
    expect(PRICING_PLANS.find((plan) => plan.name === 'Free').features)
      .toContain(`${PLAN_EVENT_LIMITS.free} événements en ligne`)
    expect(PRICING_PLANS.find((plan) => plan.name === 'Premium').features)
      .toContain(`${PLAN_EVENT_LIMITS.premium} événements en ligne`)
  })
})
