// Le plan de table s'appuie sur la même liste d'invités que la page
// Participants (tbf_guests, partagée via useLocalStorageState), pas une
// liste inventée séparée — sinon un invité ajouté dans "Participants" ne
// serait jamais assignable à une table, et inversement.
export function buildSeatingGuests(guests) {
  return guests.map((guest) => ({ id: guest.name, name: guest.name }))
}

export const INITIAL_TABLES = [
  {
    id: 't1',
    name: 'Table 1 · Famille mariée',
    capacity: 8,
    guestIds: ['Fatou Ndiaye', 'Ibrahima Sow'],
  },
  {
    id: 't2',
    name: 'Table 2 · Amis',
    capacity: 6,
    guestIds: ['Moussa Traoré'],
  },
  {
    id: 't3',
    name: 'Table 3 · Collègues',
    capacity: 8,
    guestIds: [],
  },
]
