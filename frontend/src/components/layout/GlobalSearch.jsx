import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function GlobalSearch({ placeholder, buildIndex }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const handleShortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return []
    return buildIndex()
      .filter(
        (item) =>
          item.label.toLowerCase().includes(trimmed) ||
          item.sublabel?.toLowerCase().includes(trimmed),
      )
      .slice(0, 8)
  }, [query, buildIndex])

  const goTo = (to) => {
    setOpen(false)
    setQuery('')
    navigate(to)
  }

  return (
    <div className="relative min-w-0 flex-1 max-w-md">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) goTo(results[0].to)
          if (e.key === 'Escape') {
            setOpen(false)
            inputRef.current?.blur()
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface py-2.5 pr-14 pl-10 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
      />
      {!query && (
        <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-border-soft bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-faint sm:inline-block">
          Ctrl K
        </kbd>
      )}

      {open && query.trim() && (
        <>
          <button
            type="button"
            aria-label="Fermer la recherche"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-border-soft bg-panel shadow-xl">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-faint">
                Aucun résultat pour « {query} ».
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto p-1.5">
                {results.map((item, index) => (
                  <button
                    key={`${item.to}-${item.label}-${index}`}
                    type="button"
                    onClick={() => goTo(item.to)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-surface-2"
                  >
                    <span>
                      <span className="text-ink">{item.label}</span>
                      {item.sublabel && (
                        <span className="ml-2 text-xs text-faint">
                          {item.sublabel}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-faint">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
