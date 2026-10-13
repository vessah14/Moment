import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandLogo from '../ui/BrandLogo'

const COLUMNS = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalités', to: '/#fonctionnalites' },
      { label: 'Modèles', to: '/modeles' },
      { label: 'Tarifs', to: '/tarifs' }
    ]
  },
  {
    title: "Cas d'usage",
    links: [
      { label: 'Mariage', to: '/modeles?categorie=Mariage' },
      { label: 'Conférence', to: '/modeles?categorie=Conférence' },
      { label: 'Anniversaire', to: '/modeles?categorie=Anniversaire' }
    ]
  },
  {
    title: 'Écosystème',
    links: [
      { label: 'TBF Digital', to: '/ecosysteme' },
      { label: 'Support', to: '/support' },
      { label: 'Mentions légales', to: '/mentions-legales' }
    ]
  }
]

export default function Footer () {
  const year = new Date().getFullYear()

  return (
    <footer className='border-t border-border-soft/60 bg-panel/40'>
      <div className='mx-auto max-w-7xl px-6 py-16'>
        <div className='grid gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr]'>
          <div>
            <BrandLogo className='h-9 w-auto' />
            <p className='mt-4 max-w-xs text-sm text-faint'>
              Plateforme événementielle de l'écosystème TBF.
              <br />
              Vos événements. Votre univers. Votre moment.
            </p>
            <a
              href='mailto:contact@tbfmoment.com'
              className='mt-5 inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink'
            >
              <Mail className='h-4 w-4' />
              contact@tbfmoment.com
            </a>
          </div>

          {COLUMNS.map(col => (
            <div key={col.title}>
              <h3 className='text-xs font-semibold tracking-wider text-faint uppercase'>
                {col.title}
              </h3>
              <ul className='mt-4 space-y-3'>
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className='text-sm text-muted transition hover:text-ink'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='mt-14 flex flex-col gap-4 border-t border-border-soft/60 pt-6 text-sm text-faint sm:flex-row sm:items-center sm:justify-between'>
          <p>&copy; {year} TBF Moment. Tous droits réservés.</p>
          <div className='flex flex-wrap gap-x-6 gap-y-2'>
            <Link to='/mentions-legales' className='transition hover:text-ink'>
              Mentions légales
            </Link>
            <Link to='/cgu' className='transition hover:text-ink'>
              CGU
            </Link>
            <Link to='/confidentialite' className='transition hover:text-ink'>
              Confidentialité
            </Link>
            <Link to='/cookies' className='transition hover:text-ink'>
              Cookies
            </Link>
            <Link to='/support' className='transition hover:text-ink'>
              Support
            </Link>
            <Link to='/tarifs' className='transition hover:text-ink'>
              Tarifs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
