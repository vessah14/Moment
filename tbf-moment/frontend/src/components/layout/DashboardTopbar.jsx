import { Bell, LogOut, Menu, Settings } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { buildDashboardSearchIndex } from '../../data/dashboardSearchIndex'
import Button from '../ui/Button'
import ThemeToggle from '../ui/ThemeToggle'
import GlobalSearch from './GlobalSearch'

const NOTIFICATIONS = [
  { text: '14 nouveaux RSVP sur le mariage', time: 'il y a 12 min' },
  { text: "3 messages dans le livre d'or", time: 'il y a 1 h' },
  { text: '1 paiement reçu · 35 000 FCFA', time: 'il y a 3 h' },
]

export default function DashboardTopbar({ onMenuClick }) {
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    setProfileOpen(false)
    navigate('/connexion')
  }

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
        placeholder="Rechercher un événement, un invité..."
        buildIndex={buildDashboardSearchIndex}
      />

      <div className="ml-auto flex items-center gap-3 sm:gap-5">
        <ThemeToggle className="hidden md:inline-flex" showLabels={false} />

        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative text-muted hover:text-ink"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-brand-pink" />
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
                    <div
                      key={n.text}
                      className="rounded-lg px-2 py-2 text-sm hover:bg-surface-2"
                    >
                      <p className="text-ink">{n.text}</p>
                      <p className="mt-0.5 text-xs text-faint">{n.time}</p>
                    </div>
                  ))}
                </div>
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-purple/20 text-sm font-semibold text-brand-purple"
          >
            AD
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
                  <p className="text-sm font-semibold text-ink">Awa Diop</p>
                  <p className="text-xs text-faint">awa.diop@mail.com</p>
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
