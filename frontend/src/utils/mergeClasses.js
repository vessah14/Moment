// Fusionne des classes Tailwind par défaut avec celles passées par l'appelant, en
// retirant les classes par défaut que l'appelant redéfinit. Sans ça, "inline-flex"
// (par défaut) et "hidden" (appelant) coexistent, et c'est l'ordre de la feuille CSS,
// pas l'intention de l'appelant, qui décide : le composant reste visible sur mobile.
const GROUPS = [
  { name: 'display', test: (c) => /^(hidden|block|inline|inline-block|flex|inline-flex|grid|inline-grid)$/.test(c) },
  { name: 'px', test: (c) => /^-?px-/.test(c) },
  { name: 'py', test: (c) => /^-?py-/.test(c) },
  { name: 'rounded', test: (c) => /^rounded(-|$)/.test(c) },
  { name: 'gap', test: (c) => /^gap-/.test(c) },
]

const groupOf = (cls) => GROUPS.find((g) => g.test(cls))?.name

export function mergeClasses(defaults, className = '') {
  const custom = className.split(/\s+/).filter(Boolean)
  // Seules les classes sans préfixe (pas "sm:", "hover:"...) remplacent un défaut.
  const overridden = new Set(custom.filter((c) => !c.includes(':')).map(groupOf).filter(Boolean))
  // « p-0 » remplace aussi les marges horizontales et verticales par défaut (sinon un
  // bouton icône de 40 px garde 24 px de marge de chaque côté et l'icône disparaît).
  if (custom.some((c) => /^-?p-/.test(c))) overridden.add('px').add('py')
  const kept = defaults.split(/\s+/).filter((c) => c && !overridden.has(groupOf(c)))
  return [...kept, ...custom].join(' ')
}
