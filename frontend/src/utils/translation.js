// Langue du site : français (langue d'origine) ou anglais.
//
// Les pages publiques (accueil, tarifs, modèles, billets, connexion, inscription…) sont
// traduites à la main (i18n/en.js). Les autres pages (tableau de bord…) passent encore par
// Google Traduction en anglais, en attendant leur traduction. Choisir une langue enregistre
// le cookie "googtrans" (lu par le script Google) puis recharge la page ; le script Google
// n'est chargé que sur une page non traduite à la main, et jamais en français.

import { isGuestPath } from './eventLook'

export const SOURCE_LANGUAGE = 'fr'

export const LANGUAGES = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
]

// Pages traduites à la main : jamais de Google Traduction dessus.
const HAND_TRANSLATED = [/^\/$/, /^\/tarifs\/?$/, /^\/modeles\/?$/, /^\/billets\/?$/, /^\/connexion\/?$/, /^\/inscription(\/.*)?$/,
  /^\/mot-de-passe-oublie\/?$/, /^\/reinitialiser-mot-de-passe\/?$/, /^\/verifier-email\/?$/]

export function isHandTranslatedPath(pathname) {
  return HAND_TRANSLATED.some((re) => re.test(pathname ?? ''))
}

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
  // Ancien choix (wolof, espagnol, portugais, arabe) : ces langues ne sont plus proposées.
  const value = readCookie(COOKIE)
  if (value && getCurrentLanguage() === SOURCE_LANGUAGE) writeCookie(null)
  document.documentElement.lang = getCurrentLanguage()
  syncTranslationForRoute(window.location.pathname)
}

// À chaque changement de page : Google Traduction seulement là où il n'y a pas encore de
// traduction écrite à la main. Les pages des invités (site, invitation, cadeaux) restent
// toujours dans la langue de l'organisateur.
export function syncTranslationForRoute(pathname) {
  if (getCurrentLanguage() === SOURCE_LANGUAGE || isGuestPath(pathname)) return
  const manual = isHandTranslatedPath(pathname)
  document.body.classList.toggle('notranslate', manual)
  if (manual) return
  patchDomForTranslation()
  loadGoogleTranslate()
}
