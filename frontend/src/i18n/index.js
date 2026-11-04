import { getCurrentLanguage } from '../utils/translation'
import EN_PAGES from './en'
import EN_TEMPLATES from './en-templates'

const EN = { ...EN_TEMPLATES, ...EN_PAGES }

// Traduction écrite à la main des pages publiques (accueil, tarifs, modèles, billets,
// connexion, inscription, en-tête, pied de page). Le texte français sert de clé :
//   t('Créer mon événement')            -> « Create my event » en anglais
//   t('{n} invités', { n: 50 })         -> « 50 guests »
// Changer de langue recharge la page : la langue est donc fixe pendant toute la visite.
// Une phrase absente du dictionnaire reste en français (et est signalée en développement).

export const LANG = typeof document === 'undefined' ? 'fr' : getCurrentLanguage()
export const isEnglish = LANG === 'en'

const missing = new Set()
// Texte déjà traduit repassé dans t() (ex. libellé transmis à un composant) : pas un oubli.
const englishValues = new Set(Object.values(EN))

// Remplace {clé} par sa valeur, sans traduire (textes qui restent en français).
export function fill(text, vars) {
  return vars && typeof text === 'string' ? text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? String(vars[k]) : m)) : text
}

export function t(fr, vars) {
  let text = fr
  if (isEnglish && typeof fr === 'string') {
    const en = EN[fr]
    if (en !== undefined) text = en
    else if (import.meta.env?.DEV && !missing.has(fr) && !englishValues.has(fr)) {
      missing.add(fr)
      if (typeof window !== 'undefined') (window.__i18nMissing ??= []).push(fr)
    }
  }
  return fill(text, vars)
}

// Nombres et montants à l'anglaise (100,000 FCFA) ou à la française (100 000 FCFA).
export function formatNumber(value) {
  return new Intl.NumberFormat(isEnglish ? 'en-US' : 'fr-FR').format(value).replace(/ | /g, ' ')
}

export const locale = isEnglish ? 'en-GB' : 'fr-FR'
