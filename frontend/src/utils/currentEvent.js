import { useCallback, useState } from 'react'

// Événement en cours dans le tableau de bord : choisi sur une page (Invitations),
// il reste sélectionné sur les autres (Programme, Participants...).
const KEY = 'tbf-moment-current-event'

function readStored() {
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return null
  }
}

// L'événement mémorisé s'il fait toujours partie de la liste (sinon il a été supprimé
// ou appartient à un autre compte), sinon le premier.
export function pickCurrentEvent(events, stored = readStored()) {
  return events.find((event) => event.id === stored)?.id ?? events[0]?.id ?? ''
}

// Remplace useState('') pour l'id de l'événement sélectionné : chaque choix est mémorisé.
export function useCurrentEventId(initialId = '') {
  const [eventId, setEventId] = useState(initialId)
  const select = useCallback((id) => {
    setEventId(id)
    try {
      if (id) window.localStorage.setItem(KEY, id)
    } catch {
      // stockage indisponible (navigation privée) : la sélection reste locale à la page
    }
  }, [])
  return [eventId, select]
}
