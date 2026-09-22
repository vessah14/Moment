import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

export default function DomainTab() {
  const [domain, setDomain] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!domain.trim()) return
    setMessage(
      'Domaine personnalisé réservé au plan Premium — passez au Premium pour le connecter.',
    )
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Domaine</h2>
      <p className="mt-1 text-sm text-muted">
        Votre mini-site est accessible à cette adresse, ou connectez votre
        propre domaine.
      </p>
      <p className="mt-1 text-xs text-brand-orange">
        Domaine personnalisé : bientôt disponible.
      </p>

      <div className="mt-6 rounded-xl border border-border-soft bg-surface-2 px-5 py-4">
        <p className="text-xs font-semibold tracking-wider text-faint uppercase">
          Adresse actuelle
        </p>
        <p className="mt-1.5 font-mono text-sm text-ink">
          moment.tbf/awa-ibrahim
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">
            Domaine personnalisé
          </span>
          <div className="mt-2 flex flex-wrap gap-3">
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="www.awa-et-ibrahim.com"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
            />
            <Button type="submit" variant="gradient">
              Connecter mon domaine
            </Button>
          </div>
        </label>
        {message && (
          <p className="text-sm text-brand-orange">
            {message}{' '}
            <Link to="/tarifs" className="underline">
              Voir les plans
            </Link>
          </p>
        )}
      </form>
    </div>
  )
}
