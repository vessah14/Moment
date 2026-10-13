import { AlertCircle, CheckCircle2, X } from 'lucide-react'
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
}

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
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => {
          const variant = VARIANT_STYLES[t.variant] ?? VARIANT_STYLES.success
          const Icon = variant.icon
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium shadow-xl backdrop-blur ${variant.className}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-ink">{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="text-faint hover:text-ink"
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
