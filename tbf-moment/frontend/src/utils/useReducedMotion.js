import { useEffect } from 'react'
import { useLocalStorageState } from './useLocalStorageState'

// Interrupteur manuel qui s'ajoute (jamais ne remplace) au reglage systeme
// prefers-reduced-motion, deja gere par une media query dans index.css.
export function useReducedMotion() {
  const [enabled, setEnabled] = useLocalStorageState('tbf_reduced_motion', false)

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-reduced-motion',
      enabled ? 'true' : 'false',
    )
  }, [enabled])

  return [enabled, setEnabled]
}
