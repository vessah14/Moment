// Le plan de table s'appuie sur la même liste d'invités que la page
// Participants (tbf_guests_v2, partagée via useLocalStorageState), pas une
// liste inventée séparée — sinon un invité ajouté dans "Participants" ne
// serait jamais assignable à une table, et inversement. On garde
// l'identifiant unique de l'invité (id), pas son nom, pour rester correct
// même si deux invités portent le même nom.
export function buildSeatingGuests(guests) {
  return guests.map((guest) => ({ id: guest.id, name: guest.name }))
}

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
