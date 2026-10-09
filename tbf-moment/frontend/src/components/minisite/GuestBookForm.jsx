import { useState } from 'react'
import { signPublicGuestBook } from '../../api/publicEvents'

// Formulaire du livre d'or. Sur le mini-site public, le message est enregistré en base
// et part en modération : il n'apparaît qu'une fois validé par l'organisateur.
// `onSubmit` remplace l'envoi public (Builder : l'organisateur écrit via son API) ;
// `successMessage` adapte la confirmation ; `disabled` bloque tout envoi.
export default function GuestBookForm({
  slug,
  disabled = false,
  onSubmit,
  successMessage = "Il apparaîtra ici après validation par l'organisateur.",
}) {
  const [authorName, setAuthorName] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (disabled) return
    if (!authorName.trim() || !message.trim()) return
    setSending(true)
    setError('')
    try {
      const dto = { authorName: authorName.trim(), message: message.trim() }
      await (onSubmit ? onSubmit(dto) : signPublicGuestBook(slug, dto))
      setSent(true)
      setAuthorName('')
      setMessage('')
    } catch (err) {
      setError(err.status === 429 ? 'Trop de messages envoyés. Réessayez dans une minute.' : err.message || "L'envoi a échoué.")
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-border-soft bg-surface p-4 text-center">
        <p className="text-sm font-medium text-ink">Merci pour votre message !</p>
        <p className="mt-1 text-xs text-muted">{successMessage}</p>
        <button type="button" onClick={() => setSent(false)} className="mt-3 text-xs font-medium text-brand-purple hover:underline">
          Écrire un autre message
        </button>
      </div>
    )
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple'

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-border-soft bg-surface p-4">
      <p className="text-sm font-medium text-ink">Laisser un message</p>
      <fieldset disabled={disabled} className="min-w-0 space-y-3 disabled:opacity-60">
      <input
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        maxLength={150}
        required
        placeholder="Votre nom"
        aria-label="Votre nom"
        className={inputClass}
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={2000}
        required
        rows={3}
        placeholder="Votre message pour les hôtes…"
        aria-label="Votre message"
        className={inputClass}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="rounded-full bg-brand-purple px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {sending ? 'Envoi…' : 'Envoyer'}
      </button>
      </fieldset>
    </form>
  )
}
