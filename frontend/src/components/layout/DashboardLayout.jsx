import { useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../ui/BrandLogo'
import DashboardSidebar from './DashboardSidebar'
import EmailVerificationBanner from './EmailVerificationBanner'
import DashboardTopbar from './DashboardTopbar'
import { markFirstEventPrompted } from '../../utils/firstEvent'
import { useSeo } from '../../utils/seo'

// focus : premier événement, sans le menu du tableau de bord (trop d'entrées pour un
// nouveau client) ; seulement le logo et une sortie « Plus tard ».
export default function DashboardLayout({ children, focus = false }) {
  useSeo({ title: 'Tableau de bord', noindex: true })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (focus) {
    return (
      <div className="min-h-svh">
        <header className="flex items-center justify-between gap-4 border-b border-border-soft/60 px-4 py-3 sm:px-8">
          <Link to="/" title="Retour à l'accueil">
            <BrandLogo className="h-8 w-auto" />
          </Link>
          <Link to="/dashboard" onClick={markFirstEventPrompted} className="text-sm font-medium text-muted hover:text-ink">
            Plus tard
          </Link>
        </header>
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
          <EmailVerificationBanner />
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-svh min-w-0 flex-1">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="px-4 py-6 sm:px-8 sm:py-8">
          <EmailVerificationBanner />
          {children}
        </div>
      </div>
    </div>
  )
}
