import { Bell, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentAdmin } from '../../api/client'
import { listModerationQueue, listOrganizations, listPlatformEvents } from '../../api/platform'
import { buildAdminSearchIndex } from '../../data/adminSearchIndex'
import GlobalSearch from './GlobalSearch'

function initials(fullName) {
  if (!fullName) return '?'
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function AdminTopbar({ onMenuClick }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [organizations, setOrganizations] = useState([])
  const [events, setEvents] = useState([])
  const [moderationCount, setModerationCount] = useState(0)
  const admin = getCurrentAdmin()

  useEffect(() => {
    Promise.all([listOrganizations(), listPlatformEvents(), listModerationQueue()])
      .then(([orgs, evts, queue]) => {
        setOrganizations(orgs ?? [])
        setEvents(evts ?? [])
        setModerationCount(queue?.length ?? 0)
      })
      .catch(() => {
        setOrganizations([])
        setEvents([])
        setModerationCount(0)
      })
  }, [])

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
        buildIndex={() => buildAdminSearchIndex({ organizations, events })}
      />

      <div className="ml-auto flex items-center gap-3 sm:gap-5">
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative text-muted hover:text-ink"
          >
            <Bell className="h-5 w-5" />
            {moderationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-danger" />
            )}
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
                {moderationCount > 0 ? (
                  <Link
                    to="/admin/moderation"
                    onClick={() => setNotifOpen(false)}
                    className="block rounded-lg px-2 py-2 text-sm hover:bg-surface-2"
                  >
                    <p className="text-ink">
                      {moderationCount} contenu(s) signalé(s) en attente de modération
                    </p>
                  </Link>
                ) : (
                  <p className="px-2 py-3 text-center text-xs text-faint">
                    Rien à signaler.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div
          title={admin?.fullName}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/20 text-sm font-semibold text-danger"
        >
          {initials(admin?.fullName)}
        </div>
      </div>
    </div>
  )
}
