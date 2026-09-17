import { Menu, Search } from 'lucide-react'

export default function AdminTopbar({ onMenuClick }) {
  return (
    <div className="flex items-center gap-3 border-b border-border-soft/60 px-4 py-4 sm:gap-4 sm:px-8 sm:py-5">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative min-w-0 flex-1 max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          type="search"
          placeholder="Rechercher une organisation, un événement..."
          className="w-full rounded-lg border border-border bg-surface py-2.5 pr-4 pl-10 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/20 text-sm font-semibold text-danger">
          SA
        </div>
      </div>
    </div>
  )
}
