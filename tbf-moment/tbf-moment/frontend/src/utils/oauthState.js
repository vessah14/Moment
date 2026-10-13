// Paramètre `state` de la connexion OAuth (Facebook) : une valeur aléatoire gardée dans
// l'onglet avant de partir, puis exigée au retour. Sans elle, un lien piégé vers
// /auth/facebook/callback#access_token=… connecterait la victime au compte de
// l'attaquant (« login CSRF »).

const STORAGE_KEY = 'tbf_oauth_state'

export function createOAuthState() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const state = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  try {
    sessionStorage.setItem(STORAGE_KEY, state)
  } catch {
    // Stockage indisponible : la vérification échouera au retour, sans risque.
  }
  return state
}

// Usage unique : la valeur attendue est effacée dès la vérification.
export function consumeOAuthState(received) {
  let expected = null
  try {
    expected = sessionStorage.getItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    return false
  }
  return Boolean(expected) && typeof received === 'string' && received === expected
}
