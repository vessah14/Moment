import { getMyPlan } from '../api/account'

// Premier passage d'un nouveau client : le tableau de bord vide l'envoie une fois vers la
// création de son premier événement. S'il choisit « Plus tard », on ne l'y renvoie plus
// pendant cette visite (il voit alors l'écran d'accueil du tableau de bord).
const KEY = 'tbf_first_event_prompted'
export const CREATE_EVENT_PATH = '/dashboard/evenements/nouveau'
// État de navigation : l'assistant s'ouvre directement en mode « premier événement »
// (sans le menu du tableau de bord), sans attendre la lecture de l'offre.
export const FIRST_EVENT_STATE = { firstEvent: true }

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

// Après une connexion sans page demandée (Google, mot de passe, lien de confirmation) :
// un organisateur qui n'a encore aucun événement va droit à sa création, avant le tableau
// de bord ; les autres arrivent sur le tableau de bord.
export async function goHomeAfterLogin(navigate) {
  let eventsUsed = null
  try {
    eventsUsed = (await getMyPlan())?.eventsUsed ?? null
  } catch {
    // Offre illisible : le tableau de bord fera la redirection s'il le faut.
  }
  if (eventsUsed === 0) {
    markFirstEventPrompted()
    navigate(CREATE_EVENT_PATH, { replace: true, state: FIRST_EVENT_STATE })
  } else {
    navigate('/dashboard', { replace: true })
  }
}
