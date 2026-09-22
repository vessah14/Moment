export const ORGANIZATIONS = [
  {
    id: 1,
    name: 'Awa Diop',
    email: 'awa.diop@mail.com',
    plan: 'Free',
    events: 1,
    status: 'Actif',
    joined: '12 janv. 2027',
  },
  {
    id: 2,
    name: 'TBF Digital Events',
    email: 'events@tbfdigital.com',
    plan: 'Business',
    events: 4,
    status: 'Actif',
    joined: '03 nov. 2026',
  },
  {
    id: 3,
    name: 'Fatou Sarr',
    email: 'fatou.sarr@mail.com',
    plan: 'Premium',
    events: 2,
    status: 'Actif',
    joined: '22 févr. 2027',
  },
  {
    id: 4,
    name: 'École Sup Dakar',
    email: 'contact@ecolesup.sn',
    plan: 'Event Pro',
    events: 6,
    status: 'Suspendu',
    joined: '08 sept. 2026',
  },
]

export const PLATFORM_EVENTS = [
  {
    id: 1,
    name: 'Mariage Awa & Ibrahim',
    organization: 'Awa Diop',
    category: 'Mariage',
    status: 'Publié',
    guests: 240,
    date: '14 mars 2027',
  },
  {
    id: 2,
    name: 'TBF Summit 2027',
    organization: 'TBF Digital Events',
    category: 'Conférence',
    status: 'Publié',
    guests: 500,
    date: '02 juin 2027',
  },
  {
    id: 3,
    name: '40 ans de Moussa',
    organization: 'Fatou Sarr',
    category: 'Anniversaire',
    status: 'Publié',
    guests: 140,
    date: '21 déc. 2026',
  },
  {
    id: 4,
    name: 'Remise des diplômes 2027',
    organization: 'École Sup Dakar',
    category: 'Graduation',
    status: 'Brouillon',
    guests: 320,
    date: '18 juil. 2027',
  },
]

export const TRANSACTIONS = [
  { id: 1, organization: 'TBF Digital Events', plan: 'Business', amount: 24900, date: '01 mars 2027' },
  { id: 2, organization: 'Fatou Sarr', plan: 'Premium', amount: 9900, date: '28 févr. 2027' },
  { id: 3, organization: 'École Sup Dakar', plan: 'Event Pro', amount: 49900, date: '15 févr. 2027' },
]

export const MODERATION_QUEUE = [
  {
    id: 1,
    type: 'Livre d’or',
    organization: 'Fatou Sarr',
    author: 'Invité anonyme',
    content: 'Message signalé pour contenu inapproprié.',
  },
  {
    id: 2,
    type: 'Galerie',
    organization: 'TBF Digital Events',
    author: 'Participant #482',
    content: 'Photo signalée par un autre participant.',
  },
]
