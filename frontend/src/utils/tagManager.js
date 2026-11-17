// Mesure d'audience Google, chargée SEULEMENT après « Accepter les cookies optionnels »
// dans le bandeau ou sur la page Cookies. Sans accord, aucun script Google n'est chargé
// et rien n'est envoyé.
//
// Deux façons de la brancher (variables d'environnement, vides = désactivée) :
// - VITE_GA_ID  (G-XXXXXXX)   : Google Analytics 4 directement, rien à configurer ailleurs ;
// - VITE_GTM_ID (GTM-XXXXXXX) : Google Tag Manager, les balises se règlent dans GTM.
// N'en remplir qu'une, sinon les visites seraient comptées deux fois.
//
// Le site est une application d'une seule page : à chaque changement de page on envoie
// un « page_view » nous-mêmes (Analytics ne voit pas ces changements seul).
// Pas de script inline : la règle de sécurité (CSP) n'a qu'à autoriser googletagmanager.com.

import { readCookieConsent } from '../components/layout/CookieConsent'

const GA_ID = /^G-[A-Z0-9]+$/.test(import.meta.env.VITE_GA_ID ?? '') ? import.meta.env.VITE_GA_ID : ''
const GTM_ID = /^GTM-[A-Z0-9]+$/.test(import.meta.env.VITE_GTM_ID ?? '') ? import.meta.env.VITE_GTM_ID : ''
const CONSENT_EVENT = 'tbf-moment-cookie-consent-change'
let loaded = false

function enabled() {
  // Jamais dans un aperçu affiché en cadre (téléphone de l'assistant, éditeur).
  return Boolean(GA_ID || GTM_ID) && typeof window !== 'undefined' && window.self === window.top
}

function addScript(src) {
  const script = document.createElement('script')
  script.async = true
  script.src = src
  document.head.appendChild(script)
}

function gtag() {
  // gtag.js attend l'objet « arguments » lui-même, pas un tableau.
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments)
}

function load() {
  if (loaded || !enabled() || readCookieConsent() !== 'accepted') return
  loaded = true
  window.dataLayer = window.dataLayer || []
  if (GA_ID) {
    window.gtag = gtag
    gtag('js', new Date())
    // send_page_view: false : les pages vues partent de trackPageView (y compris la première).
    gtag('config', GA_ID, { send_page_view: false })
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`)
  }
  if (GTM_ID) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
    addScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`)
  }
  trackPageView(window.location.pathname)
}

// À appeler une fois au démarrage.
export function initTagManager() {
  if (!enabled()) return
  load()
  window.addEventListener(CONSENT_EVENT, () => {
    // Accord retiré alors que la mesure tourne : on recharge pour repartir sans ses scripts.
    if (loaded && readCookieConsent() !== 'accepted') window.location.reload()
    else load()
  })
}

let lastPath = null

// À chaque changement de page.
export function trackPageView(pathname) {
  if (!loaded || pathname === lastPath) return
  lastPath = pathname
  const page = { page_path: pathname, page_location: window.location.href }
  if (GA_ID) gtag('event', 'page_view', page)
  if (GTM_ID) window.dataLayer.push({ event: 'page_view', ...page })
}
