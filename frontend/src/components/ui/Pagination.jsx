import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PAGE_SIZES, pageWindow } from '../../utils/pagination'

// Barre de pagination d'un tableau : « 1–25 sur 57 », taille de page, pages.
// À utiliser avec usePagination (utils/pagination.js).
export default function Pagination({ pagination, label = 'éléments' }) {
  const { page, pageCount, total, from, to, pageSize, fixed, setPage, setPageSize } = pagination
  if (total === 0) return null

  const buttonClass =
    'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-40'

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 text-sm text-muted">
        <span>
          <b className="font-semibold text-ink">
            {from}–{to}
          </b>{' '}
          sur {total} {label}
        </span>
        {!fixed && (
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Lignes par page</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-ink outline-none focus:border-brand-purple"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} par page
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            aria-label="Page précédente"
            className={`${buttonClass} text-muted hover:bg-surface-2 hover:text-ink`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageWindow(page, pageCount).map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="px-1 text-sm text-faint" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
                className={`${buttonClass} ${p === page ? 'bg-brand-purple text-white' : 'text-muted hover:bg-surface-2 hover:text-ink'}`}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page === pageCount}
            aria-label="Page suivante"
            className={`${buttonClass} text-muted hover:bg-surface-2 hover:text-ink`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  )
}
