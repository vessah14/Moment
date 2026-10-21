import { Component } from 'react'
import { useLocation } from 'react-router-dom'
import logoMark from '../assets/logo-mark.png'
import { isStaleBuildError, reloadOnceForNewVersion } from '../utils/staleBuild'

// Écran commun aux erreurs de la console (plantage d'une page, page introuvable).
export function AdminErrorScreen({ code, title, message, primary, details }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-bg px-6 py-20 text-center">
      <img src={logoMark} alt="" className="h-12 w-12" />
      <p className="mt-6 font-mono text-sm text-faint">{code}</p>
      <h1 className="mt-3 text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-3 max-w-md text-muted">{message}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {primary}
        <a href="/admin" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-ink hover:border-faint">
          Retour au tableau de bord
        </a>
      </div>
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
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) this.setState({ error: null, reloadFailed: false })
  }

  render() {
    if (!this.state.error) return this.props.children
    if (isStaleBuildError(this.state.error) && !this.state.reloadFailed) return null // rechargement en cours
    return (
      <AdminErrorScreen
        code="Erreur inattendue"
        title="Oups, quelque chose s'est mal passé"
        message="La page n'a pas pu s'afficher. Rechargez-la ; si le problème continue, revenez au tableau de bord."
        primary={
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Recharger la page
          </button>
        }
        details={import.meta.env.DEV ? String(this.state.error?.stack ?? this.state.error) : null}
      />
    )
  }
}

export default function ErrorBoundary({ children }) {
  const location = useLocation()
  return <Boundary resetKey={location.pathname}>{children}</Boundary>
}
