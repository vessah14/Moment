const STYLES = {
  Publié: 'bg-success/15 text-success',
  Confirmé: 'bg-success/15 text-success',
  Validé: 'bg-success/15 text-success',
  Envoyée: 'bg-success/15 text-success',
  Disponible: 'bg-success/15 text-success',
  Actif: 'bg-success/15 text-success',
  Prêt: 'bg-success/15 text-success',
  Payée: 'bg-success/15 text-success',
  Épuisé: 'bg-surface-2 text-muted',
  Offert: 'bg-surface-2 text-muted',
  'En vente': 'bg-success/15 text-success',

  Brouillon: 'bg-brand-orange/15 text-brand-orange',
  'En attente': 'bg-brand-orange/15 text-brand-orange',
  Limité: 'bg-brand-orange/15 text-brand-orange',
  'À valider': 'bg-brand-orange/15 text-brand-orange',
  Réservé: 'bg-brand-orange/15 text-brand-orange',

  Refus: 'bg-danger/15 text-danger',
  Refusé: 'bg-danger/15 text-danger',
  Signalé: 'bg-danger/15 text-danger',
  'Double scan': 'bg-danger/15 text-danger',
  Suspendu: 'bg-danger/15 text-danger',
  Archivé: 'bg-surface-2 text-muted',

  Programmé: 'bg-brand-purple/15 text-brand-purple',
  Programmée: 'bg-brand-purple/15 text-brand-purple',
  VIP: 'bg-brand-purple/15 text-brand-purple',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${STYLES[status] ?? 'bg-surface-2 text-muted'}`}
    >
      {status}
    </span>
  )
}
