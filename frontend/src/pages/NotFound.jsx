import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useSeo } from '../utils/seo'

// Deux billets qui se balancent : un billet vierge et un talon « 404 ».
function LostTickets() {
  return (
    <svg viewBox="0 0 280 170" aria-hidden="true" className="mx-auto mb-6 w-[min(280px,70vw)]">
      <defs>
        <linearGradient id="nf-grad" x1="0" x2="1">
          <stop offset="0" stopColor="#FF7A3D" />
          <stop offset=".5" stopColor="#E2337E" />
          <stop offset="1" stopColor="#8B6CFF" />
        </linearGradient>
      </defs>
      <g className="nf-sway">
        <path d="M20 40h150v26a14 14 0 0 0 0 28v26H20z" fill="#1E1347" stroke="url(#nf-grad)" strokeWidth="2.5" />
        <path d="M40 62h80M40 78h60M40 96h40" stroke="#5B4AA8" strokeWidth="5" strokeLinecap="round" />
        <path d="M150 44v72" stroke="#5B4AA8" strokeWidth="2" strokeDasharray="4 5" />
      </g>
      <g className="nf-sway" style={{ animationDelay: '-2s' }}>
        <g transform="rotate(12 223 88)">
          <path d="M186 52h74v24a12 12 0 0 1 0 24v24h-74v-24a12 12 0 0 0 0-24z" fill="#1E1347" stroke="url(#nf-grad)" strokeWidth="2.5" />
          <text x="223" y="100" fontFamily="ui-monospace, monospace" fontSize="30" fontWeight="600" fill="#F5C451" textAnchor="middle">
            404
          </text>
        </g>
      </g>
    </svg>
  )
}

export default function NotFound() {
  useSeo({ title: 'Page introuvable', noindex: true })
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <LostTickets />
      <p className="font-mono text-sm text-faint">Erreur 404</p>
      <h1 className="mt-3 text-3xl font-bold text-ink">Ce billet ne mène nulle part</h1>
      <p className="mt-3 max-w-md text-muted">
        La page que vous cherchez n'existe pas, ou plus. Le lien a peut-être été mal copié.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button as={Link} to="/" variant="gradient">
          Retour à l'accueil
        </Button>
        <Button as={Link} to="/modeles" variant="outline">
          Voir les modèles
        </Button>
        <Button as={Link} to="/dashboard/evenements/nouveau" variant="outline">
          Créer un événement
        </Button>
      </div>
      <p className="mt-7 max-w-md text-sm text-faint">
        Vous cherchez une invitation ? Vérifiez le lien reçu sur WhatsApp, ou demandez-le à l'organisateur.
      </p>
    </div>
  )
}
