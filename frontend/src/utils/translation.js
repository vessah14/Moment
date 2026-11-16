// Langue du site : français (langue d'origine) ou anglais.
//
// Pages publiques (accueil, tarifs, modèles, billets, connexion…) : traduites dans le code
// avec t() (i18n/en.js). Autres pages (tableau de bord, éditeur, création d'événement,
// pages légales…) : même dictionnaire, appliqué au texte affiché par i18n/domTranslate.js
// (dictionnaire i18n/en-app.js). Les pages des invités (site, invitation, cadeaux) restent
// toujours dans la langue de l'organisateur.
//
// Le choix est gardé dans le cookie "googtrans" (nom hérité de l'ancienne traduction
// Google, conservé pour garder le choix des visiteurs) ; en changer recharge la page.

import { isGuestPath } from './eventLook'
import { setDomTranslation } from '../i18n/domTranslate'

export const SOURCE_LANGUAGE = 'fr'

export const LANGUAGES = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
]

const COOKIE = 'googtrans'

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
  // La langue est fixe pendant une visite : on recharge pour repartir d'une page propre.
  window.location.reload()
}

// À appeler une fois au démarrage de l'application.
export function initTranslation() {
  // Ancien choix (wolof, espagnol, portugais, arabe) : ces langues ne sont plus proposées.
  const value = readCookie(COOKIE)
  if (value && getCurrentLanguage() === SOURCE_LANGUAGE) writeCookie(null)
  document.documentElement.lang = getCurrentLanguage()
  syncTranslationForRoute(window.location.pathname)
}

// À chaque changement de page : traduction partout sauf sur les pages des invités.
export function syncTranslationForRoute(pathname) {
  if (getCurrentLanguage() === SOURCE_LANGUAGE) return
  setDomTranslation(!isGuestPath(pathname))
}
