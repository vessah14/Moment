import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useSeo } from '../utils/seo'

export default function NotFound() {
  useSeo({ title: 'Page introuvable', noindex: true })
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <p className="font-mono text-sm text-faint">Erreur 404</p>
      <h1 className="mt-3 text-3xl font-bold text-ink">Page introuvable</h1>
      <p className="mt-3 max-w-sm text-muted">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Button as={Link} to="/" variant="gradient" className="mt-6">
        Retour à l'accueil
      </Button>
    </div>
  )
}
