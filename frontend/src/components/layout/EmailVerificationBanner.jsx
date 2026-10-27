import { MailCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '../../api/client'
import { refreshCurrentUser, resendVerificationEmail } from '../../api/users'
import { useToast } from '../../utils/useToast'

// Compte pas encore confirmé : tout se prépare, mais publier, payer et envoyer des e-mails
// attendent la confirmation de l'adresse (règle appliquée par l'API).
export default function EmailVerificationBanner() {
  const toast = useToast()
  const [user, setUser] = useState(getCurrentUser)
  const [sending, setSending] = useState(false)
  const pending = Boolean(user?.id) && user.emailVerified === false

  // Le lien a pu être ouvert sur un autre appareil : on relit le compte une fois.
  useEffect(() => {
    if (!pending) return undefined
    let cancelled = false
    refreshCurrentUser(user.id)
      .then((fresh) => !cancelled && setUser(fresh))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [pending, user?.id])

  if (!pending) return null

  const resend = async () => {
    setSending(true)
    try {
      await resendVerificationEmail()
      toast(`Lien de confirmation envoyé à ${user.email}`)
    } catch (err) {
      toast(err.message || 'Envoi impossible.', { variant: 'error' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div role="status" className="mb-6 flex flex-col gap-3 rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-4 py-3 text-sm text-ink sm:flex-row sm:items-center">
      <MailCheck aria-hidden="true" className="h-5 w-5 flex-none text-brand-orange" />
      <p className="flex-1">
        Confirmez votre adresse <b>{user.email}</b> pour publier votre événement, payer une offre
        ou envoyer des invitations par e-mail. Vous pouvez tout préparer en attendant.
      </p>
      <button
        type="button"
        onClick={resend}
        disabled={sending}
        className="self-start rounded-lg border border-brand-orange/40 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-brand-orange/10 disabled:opacity-50 sm:self-auto"
      >
        {sending ? 'Envoi…' : 'Renvoyer le lien'}
      </button>
    </div>
  )
}
