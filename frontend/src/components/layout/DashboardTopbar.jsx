import { Bell, LogOut, Menu, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../../api/auth'
import { CURRENT_USER_UPDATED_EVENT, getCurrentUser, mediaUrl } from '../../api/client'
import { PhotoOr } from '../ui/Avatar'
import { listEvents } from '../../api/events'
import { listGuests } from '../../api/guests'
import { buildDashboardSearchIndex } from '../../data/dashboardSearchIndex'
import { useDashboardNotifications } from './DashboardNotificationsContext'
import Button from '../ui/Button'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import GlobalSearch from './GlobalSearch'
import { useToast } from '../../utils/useToast'

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

export default function DashboardTopbar({ onMenuClick }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { items: notifications, unreadCount, error: notificationError, markRead } = useDashboardNotifications()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchData, setSearchData] = useState({ events: [], guests: [] })
  const [user, setUser] = useState(getCurrentUser)

  useEffect(() => {
    const updateUser = () => setUser(getCurrentUser())
    window.addEventListener(CURRENT_USER_UPDATED_EVENT, updateUser)
    return () => window.removeEventListener(CURRENT_USER_UPDATED_EVENT, updateUser)
  }, [])

  // Événements et invités de la recherche : chargés à la première utilisation du champ,
  // pas à chaque page du tableau de bord (tous les invités de tous les événements).
  const searchLoaded = useRef(false)
  const loadSearchData = () => {
    if (searchLoaded.current) return
    searchLoaded.current = true
    Promise.all([listEvents(), listGuests()])
      .then(([events, guests]) => setSearchData({ events: events ?? [], guests: guests ?? [] }))
      .catch(() => {
        searchLoaded.current = false
      })
  }

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/connexion')
  }

  const openNotification = async (notification) => {
    setNotifOpen(false)
    try {
      await markRead(notification.id)
      navigate(notification.link)
    } catch (error) {
      toast(error.message || 'Impossible de marquer cette notification comme lue.', { variant: 'danger' })
    }
  }

  return (
    <div className="flex items-center gap-3 border-b border-border-soft/60 px-4 py-4 sm:gap-4 sm:px-8 sm:py-5">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Ouvrir le menu du tableau de bord"
        className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <GlobalSearch
        placeholder="Rechercher un événement, un invité..."
        buildIndex={() => buildDashboardSearchIndex(searchData.events, searchData.guests)}
        onActivate={loadSearchData}
      />

      <div className="ml-auto flex items-center gap-3 sm:gap-5">
        <LanguageSwitcher />
        <ThemeToggle className="hidden md:inline-flex" showLabels={false} />

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} non lues` : 'Notifications'}
            aria-expanded={notifOpen}
            className="relative text-muted hover:text-ink"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-4 rounded-full bg-danger px-1 text-center text-[10px] font-bold leading-4 text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
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
                <div className="flex items-center justify-between px-2 pb-2">
                  <p className="text-xs font-semibold tracking-wider text-faint uppercase">Notifications</p>
                  {unreadCount > 0 && <span className="text-[11px] text-brand-purple">{unreadCount} non lue(s)</span>}
                </div>
                {notificationError && (
                  <p className="px-2 py-2 text-xs text-danger">{notificationError}</p>
                )}
                {!notificationError && notifications.length === 0 && (
                  <p className="px-2 py-4 text-center text-xs text-faint">Aucune notification pour le moment.</p>
                )}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={`w-full rounded-lg px-2 py-2 text-left hover:bg-surface-2 ${
                        notification.readAt ? '' : 'bg-brand-purple/5'
                      }`}
                    >
                      <span className="block text-xs font-semibold text-ink">{notification.title}</span>
                      <span className="mt-0.5 block text-xs text-muted">{notification.message}</span>
                      <span className="mt-1 block text-[10px] text-faint">{notification.eventName}</span>
                    </button>
                  ))}
                </div>
                <Link
                  to="/dashboard/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="mt-2 block rounded-lg px-2 py-2 text-center text-xs font-semibold text-brand-purple hover:bg-brand-purple/10"
                >
                  Voir toutes les notifications
                </Link>
              </div>
            </>
          )}
        </div>

        <Button
          as={Link}
          to="/dashboard/evenements/nouveau"
          variant="gradient"
          className="px-3 text-xs sm:px-6 sm:text-sm"
        >
          <span className="hidden sm:inline">Nouvel événement</span>
          <span className="sm:hidden">Nouvel</span>
        </Button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-label={`Menu du compte${user?.fullName ? ` de ${user.fullName}` : ''}`}
            aria-expanded={profileOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-purple/20 text-sm font-semibold text-brand-purple"
          >
              <PhotoOr src={mediaUrl(user?.photoUrl)}>{initials(user?.fullName)}</PhotoOr>
          </button>

          {profileOpen && (
            <>
              <button
                type="button"
                aria-label="Fermer le menu profil"
                onClick={() => setProfileOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div className="absolute top-full right-0 z-50 mt-3 w-56 rounded-xl border border-border-soft bg-panel p-1.5 shadow-xl">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium text-ink">
                    {user?.fullName ?? 'Utilisateur'}
                  </p>
                  <p className="truncate text-xs text-faint">{user?.email}</p>
                </div>
                <Link
                  to="/dashboard/parametres"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-ink"
                >
                  <Settings className="h-4 w-4" />
                  Paramètres
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
