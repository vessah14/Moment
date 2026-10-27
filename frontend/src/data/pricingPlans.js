// Cartes des offres (payantes : 30 jours, sans renouvellement automatique). Chaque ligne
// reprend les limites du tableau comparatif (pages/Pricing.jsx) ; événements et invités
// sont aussi ceux de subscription_plans.features en base (et de PlanService côté API).
export const PLAN_EVENT_LIMITS = {
  free: 3,
  premium: 5,
}

export const PRICING_PLANS = [
  {
    name: 'Free',
    price: '0 FCFA',
    tagline: 'Découvrir la plateforme',
    features: [
      `${PLAN_EVENT_LIMITS.free} événements en ligne`,
      '50 invités par événement',
      '20 photos dans la galerie',
      'Page, réponses et relances WhatsApp',
      'Assistance par e-mail',
    ],
    cta: 'Commencer',
  },
  {
    name: 'Premium',
    price: '5 000',
    period: '/30 jours',
    tagline: 'Mariages, dots et fêtes de famille',
    recommended: true,
    features: [
      `${PLAN_EVENT_LIMITS.premium} événements en ligne`,
      '500 invités par événement',
      '200 photos dans la galerie',
      'Modèles premium, musique et animations',
      'Plan de table, pass QR et scanner',
    ],
    cta: 'Choisir Premium',
  },
  {
    name: 'Business',
    price: '15 000',
    period: '/30 jours',
    tagline: 'Équipes et organisations',
    features: [
      'Événements illimités',
      '2 000 invités par événement',
      '1 000 photos, 5 postes d’accueil',
      'Billetterie Mobile Money (5 % de commission)',
      'Votre logo, sans la mention TBF Moment',
    ],
    cta: 'Choisir Business',
  },
  {
    name: 'Event Pro',
    price: '30 000',
    period: '/30 jours',
    tagline: "Billetterie et contrôle d'accès",
    features: [
      'Événements illimités',
      'Invités illimités',
      '5 000 photos dans la galerie',
      'Billetterie à 3 % de commission',
      'Rappels automatiques par e-mail',
    ],
    cta: 'Choisir Event Pro',
  },
  {
    name: 'Enterprise',
    price: 'Sur devis',
    tagline: 'Institutions et grands groupes',
    enterprise: true,
    features: [
      'Capacité adaptée à vos besoins',
      'Photos illimitées',
      'Modèle créé sur mesure à vos couleurs',
      'Commission billetterie négociée',
      'Un interlocuteur dédié',
    ],
    cta: 'Nous contacter',
  },
]
