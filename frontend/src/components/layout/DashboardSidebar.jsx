import {
  BarChart3,
  BookHeart,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
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
  Star,
  Table2,
  Ticket,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { listGuests } from '../../api/guests'
import UpgradeDialog from '../plan/UpgradeDialog'
import { eventUsagePercent, isEventLimitReached, usePlan } from '../../utils/usePlan'
import { GUESTS_CHANGED_EVENT } from '../../utils/guestEvents'
import BrandLogo from '../ui/BrandLogo'
import logoMark from '../../assets/logo-mark.png'
import { useLocalStorageState } from '../../utils/useLocalStorageState'

// Menu groupé par moment de l'organisation : on trouve vite ce qui sert maintenant.
const NAV_SECTIONS = [
  {
    items: [
      { label: 'Vue globale', to: '/dashboard', icon: BarChart3, end: true },
      { label: 'Créer un événement', to: '/dashboard/evenements/nouveau', icon: Plus },
      { label: 'Mes événements', to: '/dashboard/evenements', icon: Calendar, end: true },
    ],
  },
  {
    title: 'Invités',
    items: [
      { label: 'Invités & RSVP', to: '/dashboard/participants', icon: Users, badgeKey: 'guests' },
      { label: 'Envoyer des invitations', to: '/dashboard/invitations', icon: Mail },
      { label: 'Messages aux invités', to: '/dashboard/communication', icon: MessageSquare },
      { label: 'Billetterie', to: '/dashboard/billetterie', icon: Ticket },
    ],
  },
  {
    title: 'Contenu de la page',
    items: [
      { label: 'Programme', to: '/dashboard/programme', icon: ListOrdered },
      { label: 'Plan de table', to: '/dashboard/plan-de-table', icon: Table2 },
      { label: 'Liste de cadeaux', to: '/dashboard/liste-mariage', icon: Gift },
      { label: 'Conférence', to: '/dashboard/conference', icon: Mic2 },
    ],
  },
  {
    title: 'Jour J et après',
    items: [
      { label: 'Check-in', to: '/dashboard/checkin', icon: QrCode },
      { label: 'Galerie', to: '/dashboard/galerie', icon: Image },
      { label: "Livre d'or", to: '/dashboard/livre-dor', icon: BookHeart },
      { label: 'Statistiques', to: '/dashboard/statistiques', icon: BarChart3 },
    ],
  },
  {
    title: 'Compte',
    items: [
      { label: 'Mon avis', to: '/dashboard/avis', icon: Star },
      { label: 'Paramètres', to: '/dashboard/parametres', icon: Settings },
    ],
  },
]

// Nombre total d'invités de l'organisateur, tous événements confondus (lu en base).
function useGuestCount() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = () =>
      listGuests()
        .then((guests) => {
          if (!cancelled) setCount(Array.isArray(guests) ? guests.length : null)
        })
        .catch(() => {
          if (!cancelled) setCount(null)
        })
    load()
    window.addEventListener(GUESTS_CHANGED_EVENT, load)
    return () => {
      cancelled = true
      window.removeEventListener(GUESTS_CHANGED_EVENT, load)
    }
  }, [])

  return count
}

export default function DashboardSidebar({ open, onClose }) {
  const guestCount = useGuestCount()
  const badges = { guests: guestCount }
  const { plan, loading: planLoading, error: planError, retry: retryPlan } = usePlan()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [collapsed, setCollapsed] = useLocalStorageState(
    'tbf_sidebar_collapsed',
    false,
  )

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
          collapsed ? 'lg:w-20 lg:px-2' : ''
        } ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div
          className={`flex shrink-0 items-center justify-between ${
            collapsed ? 'lg:flex-col lg:gap-3' : ''
          }`}
        >
          <Link to="/" onClick={onClose} title="Retour à l'accueil">
            <BrandLogo className={`h-8 w-auto px-2 ${collapsed ? 'lg:hidden' : ''}`} />
            <img
              src={logoMark}
              alt="TBF Moment"
              className={`hidden h-8 w-8 ${collapsed ? 'lg:block' : ''}`}
            />
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? 'Développer le menu' : 'Réduire le menu'}
            aria-label={collapsed ? 'Développer le menu' : 'Réduire le menu'}
            className="hidden rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink lg:block"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex-1">
          {NAV_SECTIONS.map((section, index) => (
            <div key={section.title ?? index} className={index > 0 ? 'mt-4' : ''}>
              {section.title && (
                <p className={`mb-1 px-3 text-[11px] font-semibold tracking-wider text-faint uppercase ${collapsed ? 'lg:hidden' : ''}`}>
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
              {section.items.map((item) => {
                const badge = item.badgeKey ? badges[item.badgeKey] : null
                return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  title={item.label}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      collapsed ? 'lg:justify-center lg:px-2' : ''
                    } ${
                      isActive
                        ? 'bg-brand-indigo text-white'
                        : 'text-muted hover:bg-surface-2 hover:text-ink'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className={`flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
                    {item.label}
                  </span>
                  {badge > 0 && (
                    <span
                      className={`rounded-full bg-brand-purple/20 px-2 py-0.5 text-xs font-semibold text-brand-purple ${
                        collapsed ? 'lg:hidden' : ''
                      }`}
                    >
                      {badge > 999 ? '999+' : badge}
                    </span>
                  )}
                </NavLink>
                )
              })}
              </div>
            </div>
          ))}
        </nav>

        <Link
          to="/"
          onClick={onClose}
          title="Retour au site"
          className={`mt-2 flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink ${
            collapsed ? 'lg:justify-center lg:px-2' : ''
          }`}
        >
          <Home className="h-4 w-4 shrink-0" />
          <span className={collapsed ? 'lg:hidden' : ''}>Retour au site</span>
        </Link>

        {/* Offre en cours, lue en base : nombre d'événements utilisés et demande en cours. */}
        <div
          className={`mt-4 shrink-0 rounded-xl border border-border-soft bg-surface p-3.5 ${
            collapsed ? 'lg:hidden' : ''
          }`}
        >
          <span className="font-mono text-[11px] font-semibold tracking-wider text-brand-orange uppercase">
            Plan {plan?.planLabel ?? (planLoading ? '…' : 'indisponible')}
          </span>
          {plan && (
            <p className="mt-1.5 text-sm text-muted">
              {plan.maxEvents == null
                ? `${plan.eventsUsed} événement${plan.eventsUsed > 1 ? 's' : ''} · illimité`
                : `${plan.eventsUsed} événement${plan.eventsUsed > 1 ? 's' : ''} sur ${plan.maxEvents} utilisé${plan.eventsUsed > 1 ? 's' : ''}`}
            </p>
          )}
          {!plan && planLoading && (
            <>
              <p className="mt-1.5 text-sm text-muted">Chargement du quota d’événements…</p>
              <div
                className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border-soft"
                role="progressbar"
                aria-label="Chargement du quota d’événements"
              >
                <div className="h-full w-1/3 animate-pulse rounded-full bg-[color:var(--color-gold)]" />
              </div>
            </>
          )}
          {!plan && planError && (
            <div className="mt-2.5">
              <p className="text-xs text-danger">{planError}</p>
              <button
                type="button"
                onClick={retryPlan}
                className="mt-2 text-xs font-medium text-brand-purple hover:underline"
              >
                Réessayer
              </button>
            </div>
          )}
          {plan?.maxEvents != null && (
            <div
              className="mt-2.5 h-1.5 rounded-full bg-border-soft"
              role="progressbar"
              aria-label="Événements utilisés"
              aria-valuemin={0}
              aria-valuemax={plan.maxEvents}
              aria-valuenow={Math.min(plan.eventsUsed, plan.maxEvents)}
            >
              <div
                className={`h-full rounded-full ${isEventLimitReached(plan) ? 'bg-danger' : 'bg-[linear-gradient(92deg,_var(--color-brand-orange),_var(--color-brand-pink))]'}`}
                style={{ width: `${eventUsagePercent(plan)}%` }}
              />
            </div>
          )}
          {plan?.endsAt && (
            <p className="mt-1.5 text-xs text-faint">Jusqu'au {new Date(plan.endsAt).toLocaleDateString('fr-FR')}</p>
          )}
          {plan?.pendingRequest && (
            <p className="mt-2 text-xs font-medium text-brand-orange">Demande {plan.pendingRequest.planLabel} en cours</p>
          )}
          {plan && plan.planCode !== 'eventpro' && (
            <button
              type="button"
              onClick={() => setUpgradeOpen(true)}
              className="mt-3 w-full rounded-lg bg-[color:var(--color-gold)] py-2 text-sm font-semibold text-bg"
            >
              {plan?.pendingRequest ? 'Voir ma demande' : plan?.planCode === 'free' || !plan ? 'Passer en Premium' : 'Changer d’offre'}
            </button>
          )}
        </div>
      </aside>
      <UpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} plan={plan} />
    </>
  )
}
