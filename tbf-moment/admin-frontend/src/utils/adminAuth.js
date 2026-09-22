const SESSION_KEY = 'tbf_admin_session'

// Identifiants de démonstration — front-end uniquement, aucune vérification
// serveur derrière. À remplacer par une vraie authentification côté backend.
export const ADMIN_CREDENTIALS = {
  email: 'admin@tbfmoment.com',
  password: 'TbfAdmin2027!',
}

export function checkAdminCredentials(email, password) {
  return (
    email.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
    password === ADMIN_CREDENTIALS.password
  )
}

export function isAdminAuthenticated() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true'
  } catch {
    return false
  }
}

export function setAdminAuthenticated() {
  try {
    sessionStorage.setItem(SESSION_KEY, 'true')
  } catch {
    // sessionStorage indisponible (navigation privée, etc.)
  }
}

export function clearAdminAuthenticated() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // sessionStorage indisponible
  }
}
