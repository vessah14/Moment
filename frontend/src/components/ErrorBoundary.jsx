import { Component } from 'react'
import { useLocation } from 'react-router-dom'
import logoMark from '../assets/logo-mark.png'
import { isStaleBuildError, reloadOnceForNewVersion } from '../utils/staleBuild'

// Page affichée quand une page plante (au lieu d'un écran blanc). Volontairement
// autonome : le gabarit du site lui-même peut être la cause de l'erreur.
function ErrorScreen({ details }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-bg px-6 py-20 text-center">
      <img src={logoMark} alt="" className="h-12 w-12" />
      <p className="mt-6 font-mono text-sm text-faint">Erreur inattendue</p>
      <h1 className="mt-3 text-3xl font-bold text-ink">Oups, quelque chose s'est mal passé</h1>
      <p className="mt-3 max-w-md text-muted">
        La page n'a pas pu s'afficher. Rechargez-la ; si le problème continue, revenez à
        l'accueil ou réessayez dans quelques instants.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] px-6 py-3 text-sm font-semibold text-white shadow-lg"
        >
          Recharger la page
        </button>
        <a
          href="/"
          className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-ink hover:border-faint"
        >
          Retour à l'accueil
        </a>
      </div>
      {/* Détail technique uniquement en développement (jamais montré aux visiteurs). */}
      {details && (
        <pre className="mt-8 max-w-xl overflow-auto rounded-lg bg-surface-2 p-3 text-left text-xs text-faint">{details}</pre>
      )}
    </div>
  )
}

class Boundary extends Component {
  state = { error: null, reloadFailed: false }

  static getDerivedStateFromError(error) {
    return { error, reloadFailed: false }
  }

  componentDidCatch(error) {
    // Fichier d'une ancienne version après une mise en ligne : rechargement silencieux.
    // Déjà rechargé il y a peu (le fichier manque vraiment) : on affiche l'écran d'erreur.
    if (isStaleBuildError(error) && !reloadOnceForNewVersion()) this.setState({ reloadFailed: true })
  }

  componentDidUpdate(previousProps) {
    // Changement de page : on retente l'affichage.
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) this.setState({ error: null, reloadFailed: false })
  }

  render() {
    if (!this.state.error) return this.props.children
    if (isStaleBuildError(this.state.error) && !this.state.reloadFailed) return null // rechargement en cours
    return <ErrorScreen details={import.meta.env.DEV ? String(this.state.error?.stack ?? this.state.error) : null} />
  }
}

// Remis à zéro à chaque changement d'adresse : une erreur sur une page ne bloque pas les autres.
export default function ErrorBoundary({ children }) {
  const location = useLocation()
  return <Boundary resetKey={location.pathname}>{children}</Boundary>
}
