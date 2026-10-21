// Après une mise en ligne, les fichiers JavaScript de l'ancienne version sont remplacés.
// Un visiteur déjà sur le site qui ouvre une nouvelle page demande alors un fichier qui
// n'existe plus : on recharge la page (une seule fois) pour qu'il obtienne la nouvelle
// version, au lieu de lui montrer une erreur.

const STORAGE_KEY = 'tbf_reloaded_for_new_version'
const RELOAD_WINDOW_MS = 30_000

export function isStaleBuildError(error) {
  const message = String(error?.message ?? error ?? '')
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|ChunkLoadError/i.test(
    message,
  )
}

// Recharge la page si ce n'est pas déjà fait il y a moins de 30 s (pas de boucle si le
// fichier manque vraiment). Renvoie true si un rechargement est lancé.
export function reloadOnceForNewVersion() {
  try {
    const last = Number(sessionStorage.getItem(STORAGE_KEY) ?? 0)
    if (Date.now() - last < RELOAD_WINDOW_MS) return false
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    // Stockage indisponible : on tente quand même une fois.
  }
  window.location.reload()
  return true
}

// Vite signale l'échec de préchargement d'un fichier de page par cet événement.
export function installStaleBuildRecovery() {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadOnceForNewVersion()) event.preventDefault()
  })
}
