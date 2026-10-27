// Premier passage d'un nouveau client : le tableau de bord vide l'envoie une fois vers la
// création de son premier événement. S'il choisit « Plus tard », on ne l'y renvoie plus
// pendant cette visite (il voit alors l'écran d'accueil du tableau de bord).
const KEY = 'tbf_first_event_prompted'
export const CREATE_EVENT_PATH = '/dashboard/evenements/nouveau'

export function wasFirstEventPrompted() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}

export function markFirstEventPrompted() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    // Stockage indisponible : pas de redirection automatique (voir wasFirstEventPrompted).
  }
}
