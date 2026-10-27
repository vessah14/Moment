import { Link } from 'react-router-dom'

const SITE_HOST = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/^https?:\/\//, '').replace(/\/+$/, '')

// Adresse des pages d'événement. Le domaine personnalisé n'est pas encore branché :
// il se prépare à la main avec l'offre Enterprise, donc pas de formulaire ici.
export default function DomainTab() {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Domaine</h2>
      <p className="mt-1 text-sm text-muted">
        Chaque événement publié a sa propre adresse, prête à partager sur WhatsApp.
      </p>

      <div className="mt-6 rounded-xl border border-border-soft bg-surface-2 px-5 py-4">
        <p className="text-xs font-semibold tracking-wider text-faint uppercase">Adresse de vos événements</p>
        <p className="mt-1.5 font-mono text-sm text-ink">{SITE_HOST}/e/nom-de-votre-evenement</p>
        <p className="mt-2 text-xs text-faint">
          Retrouvez l’adresse exacte de chaque événement dans{' '}
          <Link to="/dashboard/evenements" className="font-medium text-brand-purple hover:underline">
            Mes événements
          </Link>
          .
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-border-soft px-5 py-4">
        <p className="text-sm font-semibold text-ink">Votre propre nom de domaine</p>
        <p className="mt-1 text-sm text-muted">
          Une adresse comme mariage-paul-et-anne.cm se met en place avec vous, sur l’offre Enterprise.
        </p>
        <Link to="/support" className="mt-3 inline-block text-sm font-medium text-brand-purple hover:underline">
          Nous contacter
        </Link>
      </div>
    </div>
  )
}
