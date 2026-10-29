import { formatCents } from '../../utils/formatCurrency'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getSasPayPaymentStatus,
  listMySubscriptions
} from '../../api/subscriptions'
import { notifyPlanChanged } from '../../utils/usePlan'

const SASPAY_ENABLED = import.meta.env.VITE_SASPAY_ENABLED === 'true'

export default function BillingTab () {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const paymentId = SASPAY_ENABLED ? searchParams.get('paymentId') : null
  const [payment, setPayment] = useState(null)
  const [paymentError, setPaymentError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    listMySubscriptions()
      .then(data => setSubscriptions(data ?? []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!paymentId) return undefined
    let mounted = true
    let timer
    let checks = 0

    const checkStatus = async () => {
      checks += 1
      try {
        const result = await getSasPayPaymentStatus(paymentId)
        if (!mounted) return
        setPayment(result)
        setPaymentError('')
        if (result.status === 'SUCCESSFUL') {
          notifyPlanChanged()
          try {
            const updatedSubscriptions = await listMySubscriptions()
            if (mounted) setSubscriptions(updatedSubscriptions ?? [])
          } catch (error) {
            if (mounted)
              setPaymentError(
                error.message ||
                  'Paiement confirmé, mais impossible d’actualiser votre formule.'
              )
          }
        }
        if (
          (result.status === 'PENDING' || result.status === 'CREATED') &&
          checks < 5
        )
          timer = window.setTimeout(checkStatus, 15000)
      } catch (error) {
        if (mounted)
          setPaymentError(
            error.message || 'Impossible de vérifier le paiement.'
          )
      }
    }

    checkStatus()
    return () => {
      mounted = false
      window.clearTimeout(timer)
    }
  }, [paymentId, refreshKey])

  const active =
    subscriptions.find(s => s.status === 'Actif') ?? subscriptions[0]

  return (
    <div className='rounded-2xl border border-border-soft bg-surface p-6'>
      <h2 className='text-xl font-bold text-ink'>Facturation</h2>
      <p className='mt-1 text-sm text-muted'>
        {SASPAY_ENABLED
          ? 'Les paiements d’abonnement sont traités de manière sécurisée par SasPay.'
          : 'Les offres payantes s’activent sur demande : choisissez votre offre avec « Passer en Premium », puis réglez par Mobile Money ; nous activons l’offre dès réception.'}
      </p>

      {paymentId && (
        <div
          className='mt-5 rounded-xl border border-border-soft bg-surface-2 p-4'
          aria-live='polite'
        >
          <p className='font-semibold text-ink'>
            {payment?.status === 'SUCCESSFUL'
              ? 'Paiement confirmé'
              : payment?.status === 'FAILED'
              ? 'Paiement échoué'
              : payment?.status === 'EXPIRED'
              ? 'Lien de paiement expiré'
              : 'Vérification du paiement'}
          </p>
          <p className='mt-1 text-sm text-muted'>
            {payment?.status === 'SUCCESSFUL'
              ? `Votre formule ${payment.planLabel} est activée.`
              : payment?.status === 'FAILED'
              ? 'Le paiement n’a pas été accepté. Vous pouvez relancer la souscription depuis la page Tarifs.'
              : payment?.status === 'EXPIRED'
              ? 'Le lien de paiement a expiré. Relancez la souscription depuis la page Tarifs.'
              : 'Le statut sera actualisé automatiquement après la confirmation de SasPay.'}
          </p>
          {payment &&
            payment.status !== 'SUCCESSFUL' &&
            payment.status !== 'FAILED' &&
            payment.status !== 'EXPIRED' && (
              <button
                type='button'
                onClick={() => setRefreshKey(value => value + 1)}
                className='mt-3 text-sm font-semibold text-brand-purple hover:underline'
              >
                Vérifier maintenant
              </button>
            )}
          {paymentError && (
            <p className='mt-2 text-sm text-danger'>{paymentError}</p>
          )}
        </div>
      )}

      <div className='mt-6 rounded-xl border border-border-soft bg-surface-2 p-5'>
        <p className='text-sm font-semibold text-ink'>Formule actuelle</p>
        {loading ? (
          <p className='mt-2 text-sm text-faint'>Chargement…</p>
        ) : active ? (
          <p className='mt-2 text-sm text-muted'>
            {active.planLabel} · {formatCents(active.priceCents)}
          </p>
        ) : (
          <p className='mt-2 text-sm text-muted'>Formule gratuite</p>
        )}
      </div>

      <p className='mt-6 text-xs text-muted'>
        Le renouvellement est à effectuer manuellement avant la fin de la
        période de l’offre.
      </p>
    </div>
  )
}
