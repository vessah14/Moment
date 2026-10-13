import { useCallback, useEffect, useState } from 'react'

// Petit store partagé basé sur localStorage : permet à deux pages qui ne
// partagent pas de state React (ex: la vue organisateur et la vue invité
// d'une même liste de mariage) de rester synchronisées dans le même
// navigateur — sans backend. Ce n'est PAS une vraie persistance serveur :
// deux personnes sur deux appareils différents ne se verront toujours pas.
const listeners = new Map()

function readValue(key, initialValue) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : initialValue
  } catch {
    return initialValue
  }
}

export function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue))

  useEffect(() => {
    if (!listeners.has(key)) listeners.set(key, new Set())
    const set = listeners.get(key)
    set.add(setValue)
    return () => set.delete(setValue)
  }, [key])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key || e.newValue == null) return
      try {
        const next = JSON.parse(e.newValue)
        listeners.get(key)?.forEach((setter) => setter(next))
      } catch {
        // valeur invalide, ignorée
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  const update = useCallback(
    (updater) => {
      setValue((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // stockage indisponible (navigation privée...), state local seulement
        }
        listeners.get(key)?.forEach((setter) => {
          if (setter !== setValue) setter(next)
        })
        return next
      })
    },
    [key],
  )

  return [value, update]
}
