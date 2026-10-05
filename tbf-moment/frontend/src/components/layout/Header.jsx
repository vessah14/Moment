import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import Button from '../ui/Button'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const NAV_LINKS = [
  { label: 'Fonctionnalités', href: '/#fonctionnalites' },
  { label: 'Modèles', href: '/modeles' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Écosystème', href: '/ecosysteme' },
  { label: 'Support', href: '/support' },
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

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft/60 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="TBF Moment" className="h-9 w-auto" />
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

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher className="hidden lg:inline-flex" />
          <ThemeToggle className="hidden lg:inline-flex" showLabels={false} />
          <Button
            as={Link}
            to="/connexion"
            variant="outline"
            className="hidden px-4 py-2 sm:inline-flex"
          >
            Se connecter
          </Button>
          <Button
            as={Link}
            to="/inscription"
            variant="gradient"
            className="px-4 py-2.5 sm:px-5"
          >
            Créer mon événement
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-1.5 text-ink lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-border-soft/60 px-6 py-4 lg:hidden">
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
          <Link
            to="/connexion"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-2 sm:hidden"
          >
            Se connecter
          </Link>
        </nav>
      )}
    </header>
  )
}
