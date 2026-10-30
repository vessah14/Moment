// Traduction automatique du site via Google Traduction, pilotée par notre propre bouton.
//
// Le site est écrit en français. Choisir une autre langue enregistre le cookie
// "googtrans" (lu par le script Google) puis recharge la page : le script n'est chargé
// QUE si une langue autre que le français est active — un visiteur qui reste en
// français n'envoie rien à Google.

export const SOURCE_LANGUAGE = 'fr'

export const LANGUAGES = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'wo', label: 'Wolof', short: 'WO' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'pt', label: 'Português', short: 'PT' },
  { code: 'ar', label: 'العربية', short: 'AR' },
]

const COOKIE = 'googtrans'
const SCRIPT_ID = 'google-translate-script'
const CONTAINER_ID = 'google_translate_element'

function readCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

// Le cookie peut avoir été posé sur le domaine et sur le sous-domaine : on nettoie les deux.
function writeCookie(value) {
  const host = window.location.hostname
  const domains = [null, host, host.includes('.') ? `.${host.split('.').slice(-2).join('.')}` : null]
  for (const domain of domains) {
    const domainPart = domain ? `; domain=${domain}` : ''
    document.cookie = value
      ? `${COOKIE}=${value}; path=/${domainPart}; SameSite=Lax`
      : `${COOKIE}=; path=/${domainPart}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}

export function getCurrentLanguage() {
  const value = readCookie(COOKIE) // format "/fr/en"
  const code = value?.split('/')[2]
  return LANGUAGES.some((l) => l.code === code) ? code : SOURCE_LANGUAGE
}

export function setLanguage(code) {
  if (!LANGUAGES.some((l) => l.code === code) || code === getCurrentLanguage()) return
  writeCookie(code === SOURCE_LANGUAGE ? null : `/${SOURCE_LANGUAGE}/${code}`)
  try {
    localStorage.setItem('tbf_language', code)
  } catch {
    // stockage indisponible : le cookie suffit
  }
  // Recharger est la seule façon fiable de repartir d'une page propre (retour au
  // français) ou de laisser le script traduire toute la page d'un coup.
  window.location.reload()
}

// React met à jour le texte en retirant/insérant des nœuds ; Google Traduction les a
// remplacés par ses propres <font>, ce qui fait planter React ("removeChild... not a
// child of this node"). Correctif connu : ignorer silencieusement ces cas.
function patchDomForTranslation() {
  if (typeof Node === 'undefined' || Node.prototype.__tbfTranslatePatched) return
  const originalRemoveChild = Node.prototype.removeChild
  Node.prototype.removeChild = function removeChild(child) {
    if (child.parentNode !== this) return child
    return originalRemoveChild.call(this, child)
  }
  const originalInsertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function insertBefore(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) return newNode
    return originalInsertBefore.call(this, newNode, referenceNode)
  }
  Node.prototype.__tbfTranslatePatched = true
}

function loadGoogleTranslate() {
  if (document.getElementById(SCRIPT_ID)) return

  const container = document.createElement('div')
  container.id = CONTAINER_ID
  container.style.display = 'none'
  document.body.appendChild(container)

  window.googleTranslateElementInit = () => {
    // eslint-disable-next-line no-new
    new window.google.translate.TranslateElement(
      { pageLanguage: SOURCE_LANGUAGE, autoDisplay: false },
      CONTAINER_ID,
    )
  }

  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
  script.async = true
  document.body.appendChild(script)
}

// À appeler une fois au démarrage de l'application.
export function initTranslation() {
  const language = getCurrentLanguage()
  document.documentElement.lang = language
  // Pas de bascule en droite-à-gauche pour l'arabe : les mises en page ne sont pas
  // conçues pour, le texte traduit reste lisible dans la mise en page actuelle.
  if (language === SOURCE_LANGUAGE) return
  // Pages des invités (site, invitation, cadeaux) : toujours dans la langue de
  // l'organisateur, sans bouton de traduction ni script Google.
  if (/^\/(e|invitation|cadeaux)\//.test(window.location.pathname)) return
  patchDomForTranslation()
  loadGoogleTranslate()
}
