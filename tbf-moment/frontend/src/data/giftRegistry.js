export const INITIAL_GIFTS = [
  {
    id: 1,
    name: 'Service à thé en porcelaine',
    price: 25000,
    description: 'Un service complet 6 personnes.',
    status: 'available',
    reservedBy: null,
  },
  {
    id: 2,
    name: 'Robot pâtissier',
    price: 85000,
    description: 'Pour les futurs gâteaux du dimanche.',
    status: 'reserved',
    reservedBy: 'Fatou Ndiaye',
  },
  {
    id: 3,
    name: 'Valise de voyage',
    price: 40000,
    description: 'Pour partir en lune de miel.',
    status: 'given',
    reservedBy: 'Moussa Traoré',
  },
  {
    id: 4,
    name: 'Linge de maison',
    price: 30000,
    description: 'Parure de lit et serviettes assorties.',
    status: 'available',
    reservedBy: null,
  },
]

export const INITIAL_CAGNOTTE = {
  label: 'Cagnotte lune de miel',
  target: 500000,
  raised: 180000,
  contributions: [
    { name: 'Aminata Bâ', amount: 50000 },
    { name: 'Ibrahima Sow', amount: 30000 },
    { name: 'Anonyme', amount: 100000 },
  ],
}
