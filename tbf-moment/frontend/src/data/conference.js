export const INITIAL_SPEAKERS = [
  {
    id: 1,
    name: 'Cheikh Ndiaye',
    role: 'Directeur produit · TBF Digital',
    topic: "L'avenir des plateformes événementielles en Afrique",
  },
  {
    id: 2,
    name: 'Aïssatou Diallo',
    role: 'Fondatrice · EventTech Sénégal',
    topic: 'Financer son événement avec la billetterie en ligne',
  },
  {
    id: 3,
    name: 'Modou Fall',
    role: 'Ingénieur sécurité · TBF Digital',
    topic: 'Isolation des données et sécurité multi-tenant',
  },
]

export const INITIAL_SESSIONS = [
  { id: 1, time: '09:00', title: 'Ouverture', room: 'Salle principale', speakerId: null },
  { id: 2, time: '09:30', title: "L'avenir des plateformes événementielles", room: 'Salle principale', speakerId: 1 },
  { id: 3, time: '11:00', title: 'Financer son événement', room: 'Salle B', speakerId: 2 },
  { id: 4, time: '14:00', title: 'Sécurité et isolation des données', room: 'Salle A', speakerId: 3 },
]

export const INITIAL_SPONSORS = [
  { id: 1, name: 'Orange Sénégal', tier: 'Platine' },
  { id: 2, name: 'Wave', tier: 'Or' },
  { id: 3, name: 'Sonatel Academy', tier: 'Argent' },
]

export const SPONSOR_TIERS = ['Platine', 'Or', 'Argent', 'Bronze']
