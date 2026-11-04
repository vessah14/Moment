import { PRICING_PLANS } from '../data/pricingPlans'

// Calculateur de l'accueil : cartons imprimés contre l'offre TBF MOMENT qui suffit pour ce
// nombre d'invités. Plafonds d'invités par événement : ceux des cartes de tarifs
// (data/pricingPlans.js), à garder alignés avec subscription_plans.features.
const GUEST_LIMITS = [
  ['Free', 50],
  ['Premium', 500],
  ['Business', 2000],
  ['Event Pro', Infinity],
]

const priceOf = (name) => Number(String(PRICING_PLANS.find((p) => p.name === name)?.price ?? '0').replace(/\D/g, '')) || 0

export function planForGuests(guests) {
  const [name] = GUEST_LIMITS.find(([, max]) => guests <= max)
  return { name, price: priceOf(name) }
}

export function invitationCost(guests, cardPrice) {
  const count = Math.max(0, Math.round(Number(guests) || 0))
  const unit = Math.max(0, Number(cardPrice) || 0)
  const plan = planForGuests(count)
  const paper = count * unit
  return { paper, plan, saving: Math.max(0, paper - plan.price) }
}

export const formatFcfa = (value) => `${new Intl.NumberFormat('fr-FR').format(Math.round(value)).replace(/ | /g, ' ')} FCFA`
