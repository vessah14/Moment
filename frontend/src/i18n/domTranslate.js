// Traduction anglaise des pages qui n'appellent pas encore t() (tableau de bord, éditeur,
// assistant de création, pages légales…). Remplace Google Traduction : on applique notre
// propre dictionnaire (le même que t()) directement sur le texte affiché.
//
// - Texte : chaque nœud texte dont le contenu (espaces normalisés) est une clé du
//   dictionnaire est remplacé par sa valeur anglaise ; les espaces autour sont conservés.
// - Phrases à trous : une clé « {n} invités » reconnaît « 12 invités » -> « 12 guests ».
// - Attributs : placeholder, title, aria-label, alt.
// - alert(), confirm() et prompt() : messages traduits aussi.
// - Jamais dans un élément translate="no" / .notranslate (aperçus de la page invité,
//   sélecteur de langue…) ni dans les champs de saisie.
//
// React ne relit jamais le texte du DOM : quand il le remplace (nouvelle valeur en
// français), l'observateur le voit passer et le retraduit aussitôt.

const ATTRS = ['placeholder', 'title', 'aria-label', 'alt']
const SKIP_SELECTOR = '[translate="no"], .notranslate, script, style, textarea, code, pre, [contenteditable="true"], [contenteditable=""]'
const VAR = /\{(\w+)\}/g

let dict = {}
let patterns = []
let observer = null
let active = false
const written = new WeakMap() // nœud texte -> dernière traduction posée par nous
const missing = new Set()

const normalize = (s) => s.replace(/\s+/g, ' ').trim()
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function buildPatterns() {
  patterns = []
  for (const [fr, en] of Object.entries(dict)) {
    if (!fr.includes('{')) continue
    const names = []
    const literal = fr.replace(VAR, (_, name) => {
      names.push(name)
      return '\u0000'
    })
    // Une clé faite uniquement de trous reconnaîtrait n'importe quoi.
    if (!names.length || !/[A-Za-zÀ-ÿ]/.test(literal)) continue
    // Trou vide accepté : « {0} événement{1} » reconnaît « 1 événement » (pluriel vide).
    const source = literal.split('\u0000').map(escapeRe).join('(.*?)')
    patterns.push({ re: new RegExp(`^${source}$`, 's'), names, en, weight: literal.length })
  }
  // Les clés les plus précises d'abord.
  patterns.sort((a, b) => b.weight - a.weight)
}

// Renvoie la traduction de la phrase, ou null si elle n'est pas au dictionnaire.
export function translateText(raw) {
  if (typeof raw !== 'string') return null
  const key = normalize(raw)
  if (!key || !/[A-Za-zÀ-ÿ]/.test(key)) return null
  let en = dict[key]
  if (en === undefined) {
    for (const p of patterns) {
      const m = p.re.exec(key)
      if (!m) continue
      const vars = {}
      p.names.forEach((name, i) => {
        const value = m[i + 1]
        vars[name] = dict[normalize(value)] ?? value
      })
      en = p.en.replace(VAR, (whole, name) => (vars[name] !== undefined ? vars[name] : whole))
      break
    }
  }
  if (en === undefined || en === key) return null
  // On garde les espaces autour (« Envoyée le » suivi d'une date dans un autre nœud).
  const lead = raw.match(/^\s*/)[0]
  const trail = raw.match(/\s*$/)[0]
  return lead + en + trail
}

function skipped(el) {
  return !el || (el.closest && el.closest(SKIP_SELECTOR))
}

function translateTextNode(node) {
  const value = node.nodeValue
  if (!value || written.get(node) === value) return
  if (skipped(node.parentElement)) return
  const en = translateText(value)
  if (en !== null) {
    written.set(node, en)
    node.nodeValue = en
  } else if (import.meta.env?.DEV && /[àâçéèêëîïôûùüœÉÀ]/.test(value)) {
    const key = normalize(value)
    if (!missing.has(key)) {
      missing.add(key)
      ;(window.__i18nDomMissing ??= []).push(key)
    }
  }
}

function translateAttributes(el) {
  if (skipped(el)) return
  for (const name of ATTRS) {
    const value = el.getAttribute(name)
    if (!value) continue
    const en = translateText(value)
    if (en !== null) el.setAttribute(name, en)
  }
}

function translateTree(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root)
    return
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return
  if (skipped(root)) return
  translateAttributes(root)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.nodeType === Node.ELEMENT_NODE && n.matches(SKIP_SELECTOR) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  })
  let n = walker.nextNode()
  while (n) {
    if (n.nodeType === Node.TEXT_NODE) translateTextNode(n)
    else translateAttributes(n)
    n = walker.nextNode()
  }
}

function onMutations(records) {
  if (!active) return
  for (const r of records) {
    if (r.type === 'characterData') translateTextNode(r.target)
    else if (r.type === 'attributes') translateAttributes(r.target)
    else for (const n of r.addedNodes) translateTree(n)
  }
}

function patchDialogs() {
  if (window.__tbfDialogsPatched) return
  window.__tbfDialogsPatched = true
  for (const name of ['alert', 'confirm', 'prompt']) {
    const original = window[name]
    if (typeof original !== 'function') continue
    window[name] = function translatedDialog(message, ...rest) {
      const en = active && typeof message === 'string' ? translateText(message) : null
      return original.call(window, en ?? message, ...rest)
    }
  }
}

export function setDictionary(entries) {
  dict = entries
  buildPatterns()
}

// Active ou coupe la traduction (coupée sur les pages des invités).
export function setDomTranslation(on) {
  if (typeof document === 'undefined' || on === active) return
  active = on
  if (!on) {
    observer?.disconnect()
    observer = null
    return
  }
  patchDialogs()
  translateTree(document.documentElement)
  observer = new MutationObserver(onMutations)
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS,
  })
}
