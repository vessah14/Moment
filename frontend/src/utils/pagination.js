import { useState } from 'react'
import { useLocalStorageState } from './useLocalStorageState'

// Pagination côté navigateur des tableaux du tableau de bord (les listes sont déjà
// chargées et filtrées en mémoire).

export const PAGE_SIZES = [10, 25, 50, 100]

// Tranche d'une liste pour une page (1 = première), page ramenée dans les bornes.
export function paginate(items, page, pageSize) {
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)
  const start = (current - 1) * pageSize
  return {
    page: current,
    pageCount,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
    items: items.slice(start, start + pageSize),
  }
}

// Numéros de page à afficher : la première, la dernière et les voisines de la page
// courante, avec « … » pour les trous. Ex. (6, 12) -> [1, '…', 5, 6, 7, '…', 12].
export function pageWindow(page, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const pages = new Set([1, pageCount, page - 1, page, page + 1])
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p))
  if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((p) => pages.add(p))
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  const result = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('…')
    result.push(p)
  })
  return result
}

/**
 * État de pagination d'un tableau.
 * @param {Array} items     liste complète (déjà filtrée)
 * @param {string} storageKey  clé où mémoriser la taille de page choisie
 * @param {string} resetKey    quand elle change (filtre, recherche, événement), retour page 1
 * @param {number} [fixedPageSize] taille imposée (pas de choix « par page »), ex. 5
 */
export function usePagination(items, storageKey, resetKey = '', fixedPageSize = null) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useLocalStorageState(storageKey, 25)
  const [lastResetKey, setLastResetKey] = useState(resetKey)
  if (resetKey !== lastResetKey) {
    // Ajustement pendant le rendu (recommandé par React) plutôt que dans un effet.
    setLastResetKey(resetKey)
    setPage(1)
  }
  const size = fixedPageSize ?? (PAGE_SIZES.includes(pageSize) ? pageSize : 25)
  const result = paginate(items, page, size)
  return {
    ...result,
    pageSize: size,
    fixed: Boolean(fixedPageSize),
    setPage,
    setPageSize: (next) => {
      setPageSizeState(next)
      setPage(1)
    },
  }
}
