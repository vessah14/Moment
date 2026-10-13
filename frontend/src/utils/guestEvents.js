// Prévenir la barre latérale qu'il faut recompter les invités (ajout, suppression...).
export const GUESTS_CHANGED_EVENT = 'tbf:guests-changed'

export function notifyGuestsChanged() {
  window.dispatchEvent(new Event(GUESTS_CHANGED_EVENT))
}
