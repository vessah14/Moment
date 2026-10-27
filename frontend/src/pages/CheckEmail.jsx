import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resendVerificationByEmail } from '../api/auth'
import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/ui/Button'
import { loginPathForReturnPath, returnPathFromSearch } from '../utils/returnPath'

// Après l'inscription : le compte ne sert qu'une fois l'adresse confirmée. Le message est
// le même que l'adresse soit nouvelle ou déjà inscrite (rien n'est révélé ici).
export default function CheckEmail() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const returnPath = returnPathFromSearch(window.location.search)
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')

  const resend = async () => {
    setError('')
    setState('sending')
    try {
      await resendVerificationByEmail(email)
      setState('sent')
    } catch (err) {
      setError(err.message || "L'envoi a échoué.")
      setState('idle')
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-purple/15 text-brand-purple">
          <MailCheck className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-ink">Vérifiez votre boîte e-mail</h1>
        <p className="mt-3 text-sm text-muted">
          Nous avons envoyé un lien de confirmation à{' '}
          {email ? <b className="text-ink">{email}</b> : 'votre adresse'}. Cliquez dessus pour activer votre compte.
        </p>
        <p className="mt-3 text-xs text-faint">
          Rien reçu ? Regardez dans les courriers indésirables (spam). Le lien reste valable 48 heures.
        </p>

        {state === 'sent' && (
          <p className="mt-6 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
            Si un compte en attente existe pour cette adresse, un nouveau lien vient d'être envoyé.
          </p>
        )}
        {error && (
          <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p>
        )}

        {email && state !== 'sent' && (
          <Button
            type="button"
            variant="outline"
            onClick={resend}
            disabled={state === 'sending'}
            className="mt-6 w-full disabled:opacity-60"
          >
            {state === 'sending' ? 'Envoi…' : 'Renvoyer le lien'}
          </Button>
        )}

        <Link to={returnPath ? loginPathForReturnPath(returnPath) : '/connexion'} className="mt-6 inline-block text-sm font-medium text-brand-purple hover:underline">
          Aller à la connexion
        </Link>
      </div>
    </AuthLayout>
  )
}
