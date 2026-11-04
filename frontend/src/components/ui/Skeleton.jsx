// Écrans de chargement en squelette : la page a déjà sa forme pendant que les données
// arrivent, au lieu d'un « Chargement… » sur fond vide. Pas d'animation si l'utilisateur
// a demandé moins de mouvement.

const BAR = 'rounded bg-ink/10 motion-safe:animate-pulse'

function Status({ children, className = '' }) {
  return (
    <div role="status" aria-label="Chargement" className={className}>
      {children}
      <span className="sr-only">Chargement…</span>
    </div>
  )
}

// Liste : pastille + deux lignes de texte.
export function SkeletonList({ rows = 5, className = '' }) {
  return (
    <Status className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3" aria-hidden="true">
          <span className={`h-9 w-9 shrink-0 rounded-full ${BAR}`} />
          <span className="flex-1 space-y-2">
            <span className={`block h-3 ${BAR}`} style={{ width: `${70 - (i % 3) * 12}%` }} />
            <span className={`block h-2.5 w-1/3 ${BAR}`} />
          </span>
        </div>
      ))}
    </Status>
  )
}

// Grille de cartes (photos, cadeaux, tables).
export function SkeletonGrid({ count = 6, className = 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3', aspect = 'aspect-[4/3]' }) {
  return (
    <Status className={className}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3" aria-hidden="true">
          <span className={`block w-full rounded-xl ${aspect} ${BAR}`} />
          <span className={`block h-3 w-2/3 ${BAR}`} />
        </div>
      ))}
    </Status>
  )
}

// Lignes de tableau : à placer dans <tbody>.
export function SkeletonRows({ rows = 5, cols = 4 }) {
  return Array.from({ length: rows }, (_, r) => (
    <tr key={r} aria-hidden={r > 0 ? 'true' : undefined} role={r === 0 ? 'status' : undefined} aria-label={r === 0 ? 'Chargement' : undefined}>
      {Array.from({ length: cols }, (_, c) => (
        <td key={c} className="px-6 py-4">
          <span className={`block h-3 ${BAR}`} style={{ width: c === 0 ? '75%' : `${45 + ((r + c) % 3) * 15}%` }} />
        </td>
      ))}
    </tr>
  ))
}
