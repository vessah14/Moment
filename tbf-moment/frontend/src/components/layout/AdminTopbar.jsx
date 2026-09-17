import { Menu } from 'lucide-react'
import { buildAdminSearchIndex } from '../../data/adminSearchIndex'
import GlobalSearch from './GlobalSearch'

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

      <GlobalSearch
        placeholder="Rechercher une organisation, un événement..."
        buildIndex={buildAdminSearchIndex}
      />

      <div className="ml-auto flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/20 text-sm font-semibold text-danger">
          SA
        </div>
      </div>
    </div>
  )
}
