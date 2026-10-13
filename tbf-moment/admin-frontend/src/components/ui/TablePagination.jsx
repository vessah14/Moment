import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function TablePagination ({
  page,
  pageCount,
  pageSize,
  rangeEnd,
  rangeStart,
  totalItems,
  onPageChange
}) {
  if (totalItems <= pageSize) return null

  return (
    <nav
      aria-label='Pagination du tableau'
      className='flex flex-wrap items-center justify-between gap-3 border-t border-border-soft px-5 py-3'
    >
      <p className='text-xs text-muted' aria-live='polite'>
        Affichage {rangeStart}-{rangeEnd} sur {totalItems}
      </p>
      <div className='flex flex-wrap items-center gap-3'>
        <button
          type='button'
          aria-label='Page précédente'
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className='inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition hover:bg-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronLeft className='h-4 w-4' />
        </button>
        <span className='text-xs text-muted'>
          Page {page} sur {pageCount}
        </span>
        <button
          type='button'
          aria-label='Page suivante'
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className='inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition hover:bg-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>
    </nav>
  )
}
