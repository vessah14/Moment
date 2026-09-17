export const SEATING_GUESTS = [
  { id: 'g1', name: 'Fatou Ndiaye' },
  { id: 'g2', name: 'Moussa Traoré' },
  { id: 'g3', name: 'Aminata Bâ' },
  { id: 'g4', name: 'Ibrahima Sow' },
  { id: 'g5', name: 'Khadija Fall' },
  { id: 'g6', name: 'Omar Diallo' },
  { id: 'g7', name: 'Bineta Cissé' },
  { id: 'g8', name: 'Cheikh Ndiaye' },
  { id: 'g9', name: 'Awa Sarr' },
  { id: 'g10', name: 'Modou Gueye' },
]

export const INITIAL_TABLES = [
  {
    id: 't1',
    name: 'Table 1 · Famille mariée',
    capacity: 8,
    guestIds: ['g1', 'g4'],
  },
  {
    id: 't2',
    name: 'Table 2 · Amis',
    capacity: 6,
    guestIds: ['g2'],
  },
  {
    id: 't3',
    name: 'Table 3 · Collègues',
    capacity: 8,
    guestIds: [],
  },
]
