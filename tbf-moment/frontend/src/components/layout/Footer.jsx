import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

const COLUMNS = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalités', to: '/#fonctionnalites' },
      { label: 'Modèles', to: '/modeles' },
      { label: 'Tarifs', to: '/tarifs' },
    ],
  },
  {
    title: "Cas d'usage",
    links: [
      { label: 'Mariage', to: '/modeles?categorie=Mariage' },
      { label: 'Conférence', to: '/modeles?categorie=Conférence' },
      { label: 'Anniversaire', to: '/modeles?categorie=Anniversaire' },
    ],
  },
  {
    title: 'Écosystème',
    links: [
      { label: 'TBF Digital', to: '/ecosysteme' },
      { label: 'Support', to: '/support' },
      { label: 'Mentions légales', to: '/mentions-legales' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-border-soft/60">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <img src={logo} alt="TBF Moment" className="h-9 w-auto" />
            <p className="mt-4 max-w-xs text-sm text-faint">
              Plateforme événementielle de l'écosystème TBF.
              <br />
              Vos événements. Votre univers. Votre moment.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold tracking-wider text-faint uppercase">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted transition hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
