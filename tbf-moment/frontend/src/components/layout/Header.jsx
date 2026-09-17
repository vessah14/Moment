import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

const NAV_LINKS = [
  { label: 'Fonctionnalités', href: '/#fonctionnalites' },
  { label: 'Modèles', href: '/modeles' },
  { label: 'Tarifs', href: '/tarifs' },
]

function NavLink({ link, className, onClick }) {
  if (link.href.startsWith('/')) {
    return (
      <Link to={link.href} className={className} onClick={onClick}>
        {link.label}
      </Link>
    )
  }
  return (
    <a href={link.href} className={className} onClick={onClick}>
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
            />
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/connexion"
            className="hidden text-sm font-medium text-ink sm:inline"
          >
            Se connecter
          </Link>
          <Link
            to="/inscription"
            className="bg-brand-gradient rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-pink/20 transition hover:opacity-90 sm:px-5"
          >
            Créer mon événement
          </Link>
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
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              link={link}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
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
