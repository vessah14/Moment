// Brouillon local de l'assistant de création : ce qui a été saisi est gardé sur l'appareil,
// pour le retrouver après un rechargement, un onglet fermé ou « Plus tard ». Il est effacé
// une fois l'événement créé. Le logo (fichier) n'est pas gardé : trop lourd pour le stockage.
const key = (userId) => `tbf_wizard_draft_${userId || 'anonyme'}`
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000

export function readWizardDraft(userId, storage = globalThis.localStorage, now = Date.now()) {
  try {
    const draft = JSON.parse(storage?.getItem(key(userId)) ?? 'null')
    if (!draft?.form?.univers || !draft.savedAt) return null
    if (now - new Date(draft.savedAt).getTime() > MAX_AGE_MS) {
      storage.removeItem(key(userId))
      return null
    }
    return draft
  } catch {
    return null
  }
}

export function writeWizardDraft(userId, { form, pageContent, step, templatePicked }, storage = globalThis.localStorage) {
  // Rien de choisi : pas de brouillon à proposer plus tard.
  if (!form?.univers) return
  try {
    const { logo, ...rest } = form
    storage?.setItem(
      key(userId),
      JSON.stringify({ form: rest, hadLogo: Boolean(logo), pageContent, step, templatePicked, savedAt: new Date().toISOString() }),
    )
  } catch {
    // Stockage plein ou indisponible : l'assistant fonctionne sans brouillon.
  }
}

export function clearWizardDraft(userId, storage = globalThis.localStorage) {
  try {
    storage?.removeItem(key(userId))
  } catch {
    // rien à nettoyer
  }
}
