import {
  BarChart3,
  BookHeart,
  Calendar,
  Gift,
  Home,
  Image,
  ListOrdered,
  Mail,
  MessageSquare,
  Mic2,
  Plus,
  QrCode,
  Settings,
  Table2,
  Ticket,
  Users,
  X,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'

const NAV_ITEMS = [
  { label: 'Vue globale', to: '/dashboard', icon: BarChart3, end: true },
  { label: 'Mes événements', to: '/dashboard/evenements', icon: Calendar },
  {
    label: 'Créer un événement',
    to: '/dashboard/evenements/nouveau',
    icon: Plus,
  },
  { label: 'Invitations', to: '/dashboard/invitations', icon: Mail },
  {
    label: 'Communication',
    to: '/dashboard/communication',
    icon: MessageSquare,
  },
  {
    label: 'Participants',
    to: '/dashboard/participants',
    icon: Users,
    badge: 14,
  },
  { label: 'Billetterie', to: '/dashboard/billetterie', icon: Ticket },
  { label: 'Check-in', to: '/dashboard/checkin', icon: QrCode },
  { label: 'Galerie', to: '/dashboard/galerie', icon: Image },
  { label: "Livre d'or", to: '/dashboard/livre-dor', icon: BookHeart },
  { label: 'Programme', to: '/dashboard/programme', icon: ListOrdered },
  { label: 'Plan de table', to: '/dashboard/plan-de-table', icon: Table2 },
  { label: 'Liste de mariage', to: '/dashboard/liste-mariage', icon: Gift },
  { label: 'Conférence', to: '/dashboard/conference', icon: Mic2 },
  { label: 'Statistiques', to: '/dashboard/statistiques', icon: BarChart3 },
  { label: 'Paramètres', to: '/dashboard/parametres', icon: Settings },
]

export default function DashboardSidebar({ open, onClose }) {
  const navigate = useNavigate()

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-svh w-64 shrink-0 flex-col overflow-y-auto border-r border-border-soft/60 bg-bg px-4 py-5 transition-transform lg:sticky lg:top-0 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between">
          <Link to="/" onClick={onClose} title="Retour à l'accueil">
            <img src={logo} alt="TBF Moment" className="h-8 w-auto px-2" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-indigo text-white'
                    : 'text-muted hover:bg-surface-2 hover:text-ink'
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-brand-purple/20 px-2 py-0.5 text-xs font-semibold text-brand-purple">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/"
          onClick={onClose}
          className="mt-2 flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
        >
          <Home className="h-4 w-4 shrink-0" />
          Retour au site
        </Link>

        <div className="mt-4 shrink-0 rounded-xl border border-border-soft bg-surface p-3.5">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-brand-orange uppercase">
            Plan Free
          </span>
          <p className="mt-1.5 text-sm text-muted">
            2 événements sur 3 utilisés
          </p>
          <div className="mt-2.5 h-1.5 rounded-full bg-border-soft">
            <div className="h-full w-2/3 rounded-full bg-[linear-gradient(92deg,_var(--color-brand-orange),_var(--color-brand-pink))]" />
          </div>
          <button
            type="button"
            onClick={() => {
              onClose?.()
              navigate('/tarifs')
            }}
            className="mt-3 w-full rounded-lg bg-[color:var(--color-gold)] py-2 text-sm font-semibold text-bg"
          >
            Passer en Premium
          </button>
        </div>
      </aside>
    </>
  )
}
