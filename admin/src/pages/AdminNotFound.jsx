import { AdminErrorScreen } from '../components/ErrorBoundary'

// Adresse inconnue dans la console (au lieu d'une redirection silencieuse).
export default function AdminNotFound() {
  return (
    <AdminErrorScreen
      code="Erreur 404"
      title="Page introuvable"
      message="Cette page de la console n'existe pas ou a été déplacée."
    />
  )
}
