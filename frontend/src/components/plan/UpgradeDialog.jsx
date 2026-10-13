import { Check, Clock, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cancelPlanUpgrade, requestPlanUpgrade } from '../../api/account'
import { getCurrentUser } from '../../api/client'
import { listSubscriptionPlans } from '../../api/subscriptions'
import { PRICING_PLANS } from '../../data/pricingPlans'
import { notifyPlanChanged } from '../../utils/usePlan'
import NotchPayUpgradeDialog from './NotchPayUpgradeDialog'

// Paiement Notch Pay désactivé par défaut. VITE_NOTCHPAY_ENABLED=true pour l'activer.
const NOTCHPAY_ENABLED = import.meta.env.VITE_NOTCHPAY_ENABLED === 'true'

// Fenêtre « Passer à une offre supérieure ». Pas de paiement en ligne : l'organisateur
// choisit son offre et laisse son numéro Mobile Money ; l'équipe TBF le contacte pour le
// paiement puis active l'offre depuis la console admin.

const formatFcfa = cents =>
  `${Math.round(cents / 100).toLocaleString('fr-FR')} FCFA`
const inputClass =
  'mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30'

export default function UpgradeDialog (props) {
  return NOTCHPAY_ENABLED ? (
    <NotchPayUpgradeDialog {...props} />
  ) : (
    <RequestUpgradeDialog {...props} />
  )
}

function RequestUpgradeDialog ({ open, onClose, plan, initialPlanCode }) {
  const [plans, setPlans] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [phone, setPhone] = useState(() => getCurrentUser()?.phone ?? '')
  const [message, setMessage] = useState('')
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  const dialogRef = useRef(null)
  const pending = plan?.pendingRequest

  useEffect(() => {
    if (!open) return
    let cancelled = false
    listSubscriptionPlans()
      .then(data => {
        if (cancelled) return
        const paid = (data ?? [])
          .filter(p => p.priceCents > 0)
          .sort((a, b) => a.priceCents - b.priceCents)
        setPlans(paid)
        const preferred =
          paid.find(
            p => p.code === initialPlanCode && p.code !== plan?.planCode
          ) ?? paid.find(p => p.code !== plan?.planCode)
        setSelectedId(current => current ?? preferred?.id ?? null)
      })
      .catch(() => !cancelled && setError('Impossible de charger les offres.'))
    return () => {
      cancelled = true
    }
  }, [open, initialPlanCode, plan?.planCode])

  useEffect(() => {
    if (!open) return
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    dialogRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const submit = async e => {
    e.preventDefault()
    setError('')
    setState('sending')
    try {
      await requestPlanUpgrade({
        planId: selectedId,
        phone: phone.trim(),
        message: message.trim() || null
      })
      setState('sent')
      notifyPlanChanged()
    } catch (err) {
      setError(err.message || "La demande n'a pas pu être envoyée.")
      setState('idle')
    }
  }

  const cancel = async () => {
    setError('')
    try {
      await cancelPlanUpgrade()
      notifyPlanChanged()
    } catch (err) {
      setError(err.message || "La demande n'a pas pu être annulée.")
    }
  }

  const details = label =>
    PRICING_PLANS.find(p => p.name.toLowerCase() === label.toLowerCase())

  return createPortal(
    <div
      className='fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6'
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role='dialog'
        aria-modal='true'
        aria-labelledby='upgrade-title'
        className='max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border-soft bg-bg p-6 shadow-2xl outline-none sm:rounded-2xl'
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 id='upgrade-title' className='text-xl font-bold text-ink'>
              Passer à une offre supérieure
            </h2>
            <p className='mt-1 text-sm text-muted'>
              Offre actuelle :{' '}
              <b className='text-ink'>{plan?.planLabel ?? 'Free'}</b>
              {plan?.maxEvents != null &&
                ` · ${plan.eventsUsed}/${plan.maxEvents} événement${
                  plan.maxEvents > 1 ? 's' : ''
                }`}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Fermer'
            className='rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {state === 'sent' ? (
          <div className='mt-8 text-center'>
            <span className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success'>
              <Check className='h-7 w-7' />
            </span>
            <p className='mt-4 text-lg font-semibold text-ink'>
              Demande envoyée !
            </p>
            <p className='mx-auto mt-2 max-w-md text-sm text-muted'>
              Notre équipe vous contacte au {phone} pour le paiement par Mobile
              Money. Votre offre sera activée dès réception, et vous recevrez
              une confirmation par e-mail.
            </p>
            <button
              type='button'
              onClick={onClose}
              className='mt-6 rounded-xl bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white'
            >
              Fermer
            </button>
          </div>
        ) : pending ? (
          <div className='mt-6 rounded-xl border border-brand-orange/30 bg-brand-orange/10 p-4'>
            <p className='flex items-center gap-2 font-semibold text-ink'>
              <Clock className='h-4 w-4 text-brand-orange' />
              Demande {pending.planLabel} en cours
            </p>
            <p className='mt-1 text-sm text-muted'>
              Envoyée le{' '}
              {new Date(pending.createdAt).toLocaleDateString('fr-FR')}. Notre
              équipe vous contacte au {pending.phone} pour le paiement ; l'offre
              sera activée dès réception.
            </p>
            <button
              type='button'
              onClick={cancel}
              className='mt-3 text-sm font-semibold text-danger hover:underline'
            >
              Annuler la demande
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className='mt-6 space-y-5'>
            <fieldset>
              <legend className='text-sm font-medium text-ink'>
                Choisissez votre offre
              </legend>
              <div className='mt-2 grid gap-3 sm:grid-cols-3'>
                {plans.map(p => {
                  const current = p.code === plan?.planCode
                  const selected = p.id === selectedId
                  const info = details(p.label)
                  return (
                    <label
                      key={p.id}
                      className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition ${
                        current
                          ? 'cursor-not-allowed opacity-50'
                          : selected
                          ? 'border-brand-purple ring-2 ring-brand-purple/30'
                          : 'border-border hover:border-faint'
                      }`}
                    >
                      <input
                        type='radio'
                        name='plan'
                        className='sr-only'
                        value={p.id}
                        checked={selected}
                        disabled={current}
                        onChange={() => setSelectedId(p.id)}
                      />
                      <span className='font-semibold text-ink'>{p.label}</span>
                      <span className='mt-1 font-mono text-lg font-bold text-ink'>
                        {formatFcfa(p.priceCents)}
                        <span className='ml-1 font-sans text-xs font-normal text-faint'>
                          /mois
                        </span>
                      </span>
                      {current && (
                        <span className='mt-1 text-xs text-faint'>
                          Votre offre actuelle
                        </span>
                      )}
                      <ul className='mt-2 space-y-1 text-xs text-muted'>
                        {(info?.features ?? []).slice(0, 3).map(f => (
                          <li key={f} className='flex gap-1.5'>
                            <Check className='mt-0.5 h-3 w-3 shrink-0 text-brand-purple' />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {selected && (
                        <Check className='absolute top-3 right-3 h-4 w-4 text-brand-purple' />
                      )}
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <label className='block'>
              <span className='text-sm font-medium text-ink'>
                Numéro Mobile Money
              </span>
              <input
                type='tel'
                required
                inputMode='tel'
                maxLength={30}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder='6 99 00 00 00'
                className={inputClass}
              />
              <span className='mt-1 block text-xs text-faint'>
                Nous vous appelons à ce numéro pour finaliser le paiement
                (Orange Money ou MTN MoMo).
              </span>
            </label>

            <label className='block'>
              <span className='text-sm font-medium text-ink'>
                Message (facultatif)
              </span>
              <textarea
                rows={2}
                maxLength={1000}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </label>

            {error && (
              <p className='rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger'>
                {error}
              </p>
            )}

            <div className='flex flex-wrap items-center justify-end gap-3'>
              <button
                type='button'
                onClick={onClose}
                className='rounded-xl px-4 py-2.5 text-sm font-semibold text-muted hover:text-ink'
              >
                Plus tard
              </button>
              <button
                type='submit'
                disabled={!selectedId || state === 'sending'}
                className='rounded-xl bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50'
              >
                {state === 'sending' ? 'Envoi…' : 'Envoyer ma demande'}
              </button>
            </div>
          </form>
        )}
        {pending && error && (
          <p className='mt-3 text-sm text-danger'>{error}</p>
        )}
      </div>
    </div>,
    document.body
  )
}
