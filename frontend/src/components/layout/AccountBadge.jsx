import { Link } from 'react-router-dom'

function initials(fullName) {
  if (!fullName) return '?'
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Badge du compte connecté dans l'en-tête du site : un clic ramène au tableau de bord.
export default function AccountBadge({ user, className = '', onClick }) {
  const firstName = user?.fullName?.split(' ').filter(Boolean)[0]
  return (
    <Link
      to="/dashboard"
      onClick={onClick}
      title="Aller à mon tableau de bord"
      className={`group inline-flex items-center gap-2.5 rounded-full border border-border-soft bg-surface/70 py-1 pr-1 pl-1 transition hover:border-brand-purple/60 hover:bg-surface xl:pr-4 ${className}`}
    >
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
        {initials(user?.fullName)}
        <span aria-hidden="true" className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-success" />
      </span>
      <span className="hidden max-w-40 truncate text-sm font-semibold whitespace-nowrap text-ink xl:inline">
        {firstName ? `Bonjour ${firstName}` : 'Mon compte'}
      </span>
      <span className="sr-only">Aller à mon tableau de bord</span>
    </Link>
  )
}
