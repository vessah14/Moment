import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getCurrentUser, isAuthenticated } from '../../api/client'
import BrandLogo from '../ui/BrandLogo'
import AccountBadge from './AccountBadge'
import Button from '../ui/Button'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { t } from '../../i18n'

const NAV_LINKS = [
  { label: t("Accueil"), href: '/' },
  { label: t("Modèles"), href: '/modeles' },
  { label: t("Tarifs"), href: '/tarifs' },
]

function NavLink({ link, className, activeClassName, onClick }) {
  const { pathname } = useLocation()
  const isActive = link.href.startsWith('/') && !link.href.includes('#') && pathname === link.href
  const finalClassName = `${className} ${isActive ? activeClassName : ''}`

  if (link.href.startsWith('/')) {
    return (
      <Link to={link.href} className={finalClassName} onClick={onClick}>
        {link.label}
      </Link>
    )
  }
  return (
    <a href={link.href} className={finalClassName} onClick={onClick}>
      {link.label}
    </a>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  // Compte connecté (jeton encore valide) : badge vers le tableau de bord.
  const user = isAuthenticated() ? getCurrentUser() ?? {} : null

  return (
    <header translate="no" className="sticky top-0 z-40 border-b border-border-soft/60 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-20 sm:px-6">
        <Link to="/" className="flex items-center">
          <BrandLogo className="h-8 w-auto sm:h-9" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              link={link}
              className="text-sm text-muted transition hover:text-ink"
              activeClassName="!text-ink font-medium"
            />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <LanguageSwitcher className="hidden lg:inline-flex" />
          <ThemeToggle className="hidden lg:inline-flex" showLabels={false} />
          {user ? (
            <>
              <Button
                as={Link}
                to="/dashboard/evenements/nouveau"
                variant="gradient"
                className="hidden px-5 py-2.5 whitespace-nowrap xl:inline-flex"
              >
                {t("Créer un événement")}
              </Button>
              <AccountBadge user={user} />
            </>
          ) : (
            <>
              <Button
                as={Link}
                to="/connexion"
                variant="outline"
                className="hidden px-4 py-2 sm:inline-flex"
              >
                {t("Se connecter")}
              </Button>
              <Button
                as={Link}
                to="/inscription"
                variant="gradient"
                className="shrink-0 px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm"
              >
                <span className="sm:hidden">{t("Créer")}</span>
                <span className="hidden sm:inline">{t("Créer mon événement")}</span>
              </Button>
            </>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? t("Fermer le menu principal") : t("Ouvrir le menu principal")}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-border-soft/60 px-4 py-4 sm:px-6 lg:hidden">
          <div className="mb-2 flex items-center gap-3">
            <ThemeToggle className="w-fit" />
            <LanguageSwitcher align="left" />
          </div>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              link={link}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
              activeClassName="!bg-surface-2 !text-ink"
            />
          ))}
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-purple hover:bg-surface-2"
              >
                {t("Mon tableau de bord")}
              </Link>
              <Link
                to="/dashboard/evenements/nouveau"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-2"
              >
                {t("Créer un événement")}
              </Link>
            </>
          ) : (
            <Link
              to="/connexion"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-2 sm:hidden"
            >
              {t("Se connecter")}
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
