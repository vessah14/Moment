import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandLogo from '../ui/BrandLogo'
import { t } from '../../i18n'

const COLUMNS = [
  {
    title: t("Produit"),
    links: [
      { label: t("Fonctionnalités"), to: '/#fonctionnalites' },
      { label: t("Modèles"), to: '/modeles' },
      { label: t("Modèles de billets"), to: '/billets' },
      { label: t("Tarifs"), to: '/tarifs' }
    ]
  },
  {
    title: t("Cas d'usage"),
    links: [
      { label: t("Mariage"), to: '/modeles?categorie=Mariage' },
      { label: t("Conférence"), to: '/modeles?categorie=Conférence' },
      { label: t("Anniversaire"), to: '/modeles?categorie=Anniversaire' }
    ]
  },
  {
    title: t("Ressources"),
    links: [
      { label: t("Écosystème TBF"), to: '/ecosysteme' },
      { label: t("Support"), to: '/support' }
    ]
  }
]

export default function Footer () {
  const year = new Date().getFullYear()

  return (
    <footer translate='no' className='border-t border-border-soft/60 bg-panel/40'>
      <div className='mx-auto max-w-7xl px-6 py-16'>
        <div className='grid gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr]'>
          <div>
            <BrandLogo className='h-9 w-auto' />
            <p className='mt-4 max-w-xs text-sm text-faint'>
              {t("Plateforme événementielle de l'écosystème TBF.")}
              <br />
              {t("Vos événements. Votre univers. Votre moment.")}
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
          <p>&copy; {year} TBF Moment. {t('Tous droits réservés.')}</p>
          <div className='flex flex-wrap gap-x-6 gap-y-2'>
            <Link to='/mentions-legales' className='transition hover:text-ink'>
              {t("Mentions légales")}
            </Link>
            <Link to='/cgu' className='transition hover:text-ink'>
              {t("CGU")}
            </Link>
            <Link to='/confidentialite' className='transition hover:text-ink'>
              {t("Confidentialité")}
            </Link>
            <Link to='/cookies' className='transition hover:text-ink'>
              {t("Cookies")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
