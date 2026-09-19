import { Bell, Menu } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buildAdminSearchIndex } from '../../data/adminSearchIndex'
import { MODERATION_QUEUE } from '../../data/adminData'
import GlobalSearch from './GlobalSearch'

const NOTIFICATIONS = [
  {
    text: `${MODERATION_QUEUE.length} contenu(s) signalé(s) en attente de modération`,
    time: 'il y a 8 min',
    to: '/admin/moderation',
  },
  {
    text: 'Nouvelle organisation inscrite · École Sup Dakar',
    time: 'il y a 2 h',
    to: '/admin/organisations',
  },
  {
    text: 'Paiement reçu · TBF Digital Events · 24 900 FCFA',
    time: 'hier',
    to: '/admin/facturation',
  },
]

export default function AdminTopbar({ onMenuClick }) {
  const [notifOpen, setNotifOpen] = useState(false)

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

      <div className="ml-auto flex items-center gap-3 sm:gap-5">
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative text-muted hover:text-ink"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-danger" />
          </button>

          {notifOpen && (
            <>
              <button
                type="button"
                aria-label="Fermer les notifications"
                onClick={() => setNotifOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div className="absolute top-full right-0 z-50 mt-3 w-72 rounded-xl border border-border-soft bg-panel p-3 shadow-xl">
                <p className="px-2 pb-2 text-xs font-semibold tracking-wider text-faint uppercase">
                  Notifications
                </p>
                <div className="space-y-1">
                  {NOTIFICATIONS.map((n) => (
                    <Link
                      key={n.text}
                      to={n.to}
                      onClick={() => setNotifOpen(false)}
                      className="block rounded-lg px-2 py-2 text-sm hover:bg-surface-2"
                    >
                      <p className="text-ink">{n.text}</p>
                      <p className="mt-0.5 text-xs text-faint">{n.time}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/20 text-sm font-semibold text-danger">
          SA
        </div>
      </div>
    </div>
  )
}
