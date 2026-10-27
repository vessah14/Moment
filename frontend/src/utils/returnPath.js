// Page à rouvrir après la connexion (ex. "Utiliser ce modèle" → assistant de création).
// Seuls les chemins internes sont acceptés ("/..." mais pas "//site.com") pour qu'un
// lien piégé ne puisse pas rediriger l'utilisateur vers un site externe après connexion.
const STORAGE_KEY = 'tbf_return_path'

function sanitize(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : null
}

export function returnPathFrom(location) {
  const from = location?.state?.from
  return from ? sanitize(`${from.pathname ?? ''}${from.search ?? ''}`) : null
}

export function returnPathFromSearch(search) {
  const params = new URLSearchParams(search ?? '')
  const returnPath = sanitize(params.get('retour'))
  if (returnPath) return returnPath

  const template = params.get('modele')
  return template
    ? `/dashboard/evenements/nouveau?modele=${encodeURIComponent(template)}`
    : null
}

export function requestedReturnPath(location) {
  return returnPathFrom(location) ?? returnPathFromSearch(location?.search) ?? peekReturnPath()
}

export function loginPathForReturnPath(path) {
  const safe = sanitize(path)
  if (!safe) return '/connexion'

  const params = new URLSearchParams({ retour: safe })
  const template = new URLSearchParams(safe.split('?')[1] ?? '').get('modele')
  if (template) params.set('modele', template)
  return `/connexion?${params}`
}

// Connexion Facebook : l'utilisateur quitte le site puis revient sur /auth/facebook/callback,
// l'état du routeur est perdu — on garde la destination dans sessionStorage.
export function rememberReturnPath(path) {
  const safe = sanitize(path)
  try {
    if (safe) sessionStorage.setItem(STORAGE_KEY, safe)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // stockage indisponible (navigation privée) : retour au tableau de bord
  }
}

export function consumeReturnPath() {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    return sanitize(value)
  } catch {
    return null
  }
}

export function peekReturnPath() {
  try {
    return sanitize(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}
