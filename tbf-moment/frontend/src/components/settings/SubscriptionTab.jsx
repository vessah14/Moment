import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

const FEATURES = [
  '1 événement actif',
  'Modèles gratuits uniquement',
  'Jusqu’à 50 invités',
  'Marque TBF Moment visible',
]

export default function SubscriptionTab() {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Abonnement</h2>
      <p className="mt-1 text-sm text-muted">
        Gérez votre formule et débloquez plus de modules pour vos événements.
      </p>

      <div className="mt-6 rounded-xl border border-border-soft bg-surface-2 p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-semibold tracking-wider text-brand-orange uppercase">
            Plan actuel · Free
          </span>
          <Button as={Link} to="/tarifs" variant="gradient">
            Passer en Premium
          </Button>
        </div>
        <ul className="mt-4 space-y-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-muted">
              <Check className="h-4 w-4 text-success" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs text-faint">
        Comparez toutes les formules sur la{' '}
        <Link to="/tarifs" className="text-brand-purple hover:underline">
          page tarifs
        </Link>
        .
      </p>
    </div>
  )
}
