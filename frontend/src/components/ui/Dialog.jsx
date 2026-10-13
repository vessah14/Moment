import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

// Fenêtre modale du tableau de bord : Échap ou clic à l'extérieur pour fermer, focus
// placé dans la fenêtre à l'ouverture et rendu à l'élément d'origine à la fermeture.
export default function Dialog({ open, title, onClose, children, footer, size = 'max-w-lg' }) {
  const ref = useRef(null)
  const titleId = useId()
  // Fonction de fermeture la plus récente, sans relancer l'effet (le focus ne doit pas
  // revenir au premier champ à chaque frappe).
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current()
    window.addEventListener('keydown', onKey)
    const first = ref.current?.querySelector('input, select, textarea, button:not([data-close])')
    ;(first ?? ref.current)?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [open])

  if (!open) return null
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`max-h-[92svh] w-full ${size} overflow-y-auto rounded-t-2xl border border-border-soft bg-bg p-6 shadow-2xl outline-none sm:rounded-2xl`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-bold text-ink">
            {title}
          </h2>
          <button type="button" data-close onClick={onClose} aria-label="Fermer" className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
        {footer && <div className="mt-6 flex flex-wrap items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

// Confirmation d'une action destructive (suppression).
export function ConfirmDialog({ open, title, message, confirmLabel = 'Supprimer', busy = false, onConfirm, onClose }) {
  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      size="max-w-md"
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted hover:text-ink">
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Suppression…' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-muted">{message}</p>
    </Dialog>
  )
}
