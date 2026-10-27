// Page à rouvrir après la connexion (ex. "Utiliser ce modèle" → assistant de création).
// Seuls les chemins internes sont acceptés ("/..." mais pas "//site.com") pour qu'un
// lien piégé ne puisse pas rediriger l'utilisateur vers un site externe après connexion.
const STORAGE_KEY = 'tbf_return_path'
const SIGNUP_RETURN_STORAGE_KEY = 'tbf_signup_return_path'
const SIGNUP_RETURN_TTL_MS = 48 * 60 * 60 * 1000

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

// Email verification may open in a new tab, so sessionStorage is not sufficient here.
export function rememberSignupReturnPath(path) {
  try {
    const safe = sanitize(path)
    if (!safe) {
      localStorage.removeItem(SIGNUP_RETURN_STORAGE_KEY)
      return
    }
    localStorage.setItem(
      SIGNUP_RETURN_STORAGE_KEY,
      JSON.stringify({ path: safe, savedAt: Date.now() }),
    )
  } catch {
    // Continue signup if browser storage is unavailable.
  }
}

export function peekSignupReturnPath() {
  try {
    const value = localStorage.getItem(SIGNUP_RETURN_STORAGE_KEY)
    if (!value) return null
    const saved = JSON.parse(value)
    if (
      typeof saved?.savedAt !== 'number' ||
      Date.now() - saved.savedAt > SIGNUP_RETURN_TTL_MS
    ) {
      localStorage.removeItem(SIGNUP_RETURN_STORAGE_KEY)
      return null
    }
    return sanitize(saved.path)
  } catch {
    return null
  }
}

export function consumeSignupReturnPath() {
  const path = peekSignupReturnPath()
  try {
    localStorage.removeItem(SIGNUP_RETURN_STORAGE_KEY)
  } catch {
    // Return the validated in-memory value even if cleanup is unavailable.
  }
  return path
}
