import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { ToastContext } from '../../utils/useToast'

let idCounter = 0

const VARIANT_STYLES = {
  success: {
    icon: CheckCircle2,
    className: 'border-success/30 bg-success/15 text-success',
  },
  danger: {
    icon: AlertCircle,
    className: 'border-danger/30 bg-danger/15 text-danger',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-brand-orange/30 bg-brand-orange/15 text-brand-orange',
  },
  info: {
    icon: Info,
    className: 'border-brand-purple/30 bg-brand-purple/15 text-brand-purple',
  },
}
// Ancien nom utilisé par certaines pages.
VARIANT_STYLES.error = VARIANT_STYLES.danger

// Notifications en bas de l'écran : toast(message, { variant, duration }). Elles restent
// affichées après un changement de page (le fournisseur entoure toutes les routes).
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message, options = {}) => {
      const id = ++idCounter
      const duration = options.duration ?? 3000
      setToasts((prev) => [
        ...prev,
        { id, message, variant: options.variant ?? 'success' },
      ])
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-100 flex flex-col items-center gap-2 px-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const variant = VARIANT_STYLES[t.variant] ?? VARIANT_STYLES.success
          const Icon = variant.icon
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex max-w-xl items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-medium shadow-xl backdrop-blur motion-safe:animate-[toast-in_.25s_ease-out] ${variant.className}`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-ink">{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-faint hover:text-ink"
                aria-label="Fermer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
