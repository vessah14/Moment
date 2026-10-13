import {
  Banknote,
  Building2,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  ShieldAlert,
  Sliders,
  X
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import logoMark from '../../assets/logo-mark.png'
import { clearAdminAuthenticated } from '../../utils/adminAuth'
import { useLocalStorageState } from '../../utils/useLocalStorageState'

const CLIENT_APP_URL =
  import.meta.env.VITE_CLIENT_APP_URL || 'http://localhost:5173'

const NAV_ITEMS = [
  { label: 'Vue globale', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Organisations', to: '/admin/organisations', icon: Building2 },
  { label: 'Événements', to: '/admin/evenements', icon: Calendar },
  { label: 'Facturation', to: '/admin/facturation', icon: Banknote },
  { label: 'Avis clients', to: '/admin/avis', icon: MessageSquareText },
  { label: 'Modération', to: '/admin/moderation', icon: ShieldAlert },
  { label: 'Paramètres système', to: '/admin/parametres', icon: Sliders }
]

export default function AdminSidebar ({ open, onClose }) {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useLocalStorageState(
    'tbf_admin_sidebar_collapsed',
    false
  )

  const handleLogout = () => {
    clearAdminAuthenticated()
    onClose?.()
    navigate('/admin/connexion', { replace: true })
  }

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className='fixed inset-0 z-40 bg-black/60 lg:hidden'
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-svh w-64 shrink-0 flex-col border-r border-border-soft/60 bg-bg px-4 py-6 transition-transform lg:sticky lg:top-0 lg:translate-x-0 ${
          collapsed ? 'lg:w-20 lg:px-2' : ''
        } ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className='flex items-center justify-between'>
          <img
            src={logo}
            alt='TBF Moment'
            className={`h-8 w-auto px-2 ${collapsed ? 'lg:hidden' : ''}`}
          />
          <img
            src={logoMark}
            alt='TBF Moment'
            className={`hidden h-8 w-8 ${collapsed ? 'lg:block' : ''}`}
          />
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-1.5 text-muted hover:bg-surface-2 lg:hidden'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <span
          className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-3 py-1 text-xs font-semibold tracking-wide text-danger uppercase ${
            collapsed ? 'lg:hidden' : ''
          }`}
        >
          <ShieldAlert className='h-3.5 w-3.5' />
          Super Admin
        </span>

        <nav className='mt-6 flex-1 space-y-1 overflow-y-auto'>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              onClick={onClose}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  collapsed ? 'lg:justify-center lg:px-2' : ''
                } ${
                  isActive
                    ? 'bg-danger text-white'
                    : 'text-muted hover:bg-surface-2 hover:text-ink'
                }`
              }
            >
              <item.icon className='h-4 w-4 shrink-0' />
              <span className={`flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <button
          type='button'
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? 'Développer le menu' : 'Réduire le menu'}
          className='mb-3 hidden shrink-0 items-center justify-center gap-2 rounded-lg border border-border-soft py-2 text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-ink lg:flex'
        >
          {collapsed ? (
            <ChevronsRight className='h-4 w-4' />
          ) : (
            <>
              <ChevronsLeft className='h-4 w-4' />
              Réduire
            </>
          )}
        </button>

        <div className='space-y-1'>
          <a
            href={`${CLIENT_APP_URL}/dashboard`}
            title='Retour au dashboard'
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink ${
              collapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
          >
            <Home className='h-4 w-4 shrink-0' />
            <span className={collapsed ? 'lg:hidden' : ''}>
              Retour au dashboard
            </span>
          </a>
          <button
            type='button'
            onClick={handleLogout}
            title='Se déconnecter'
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/10 ${
              collapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
          >
            <LogOut className='h-4 w-4 shrink-0' />
            <span className={collapsed ? 'lg:hidden' : ''}>Se déconnecter</span>
          </button>
        </div>
      </aside>
    </>
  )
}
