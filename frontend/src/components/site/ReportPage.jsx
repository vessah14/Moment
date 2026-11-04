import { useState } from 'react'
import { Link } from 'react-router-dom'
import { reportPublicPage } from '../../api/publicEvents'
import Dialog from '../ui/Dialog'

// « Signaler cette page », en pied de chaque page d'événement : faux événement, faux avis
// de décès, photo publiée sans accord… Le signalement va à l'équipe TBF MOMENT, pas à
// l'organisateur.
const REPORT_REASONS = [
  ['arnaque', 'Faux événement, arnaque ou faux billets'],
  ['deces', 'Faux avis de décès ou fausse annonce sur une personne vivante'],
  ['image', 'Ma photo ou mes données sont publiées sans mon accord'],
  ['choquant', 'Contenu choquant, haineux ou humiliant'],
  ['usurpation', "Usurpation d'une personne, d'une famille ou d'une structure"],
  ['autre', 'Autre problème'],
]

export default function ReportPageLink({ slug, className = '', label = 'Signaler cette page' }) {
  const [open, setOpen] = useState(false)
  if (!slug) return null
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`cursor-pointer underline-offset-2 hover:underline ${className}`}>
        {label}
      </button>
      {open && <ReportDialog slug={slug} onClose={() => setOpen(false)} />}
    </>
  )
}

function ReportDialog({ slug, onClose }) {
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [state, setState] = useState('form') // form | sending | sent
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!reason) {
      setError('Choisissez un motif.')
      return
    }
    setState('sending')
    setError('')
    try {
      await reportPublicPage(slug, { reason, message: message.trim(), contact: contact.trim() })
      setState('sent')
    } catch (err) {
      setError(err.message || "L'envoi a échoué. Réessayez.")
      setState('form')
    }
  }

  if (state === 'sent') {
    return (
      <Dialog
        open
        title="Merci, c'est envoyé"
        onClose={onClose}
        footer={
          <button type="button" onClick={onClose} className="rounded-lg bg-brand-purple px-4 py-2 text-sm font-semibold text-white">
            Fermer
          </button>
        }
      >
        <p className="text-sm text-muted">
          Nous examinons cette page sous 48 h.{contact.trim() && ' Nous vous répondrons au contact indiqué.'} En cas d'urgence (menace, arnaque en
          cours), écrivez aussi à{' '}
          <a href="mailto:contact@tbfmoment.com" className="font-semibold text-brand-purple hover:underline">
            contact@tbfmoment.com
          </a>
          .
        </p>
      </Dialog>
    )
  }

  return (
    <Dialog open title="Signaler cette page" onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <p className="text-sm text-muted">
          Votre signalement est envoyé à l'équipe TBF MOMENT, pas à l'organisateur. Nous l'examinons sous 48 h et retirons la page si elle enfreint
          nos{' '}
          <Link to="/cgu" target="_blank" rel="noopener" className="font-semibold text-brand-purple hover:underline">
            conditions
          </Link>
          .
        </p>
        <fieldset className="space-y-2">
          <legend className="sr-only">Motif</legend>
          {REPORT_REASONS.map(([value, text]) => (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm text-ink ${reason === value ? 'border-brand-purple bg-brand-purple/5' : 'border-border-soft'}`}
            >
              <input
                type="radio"
                name="report-reason"
                value={value}
                checked={reason === value}
                onChange={() => {
                  setReason(value)
                  setError('')
                }}
                className="mt-0.5 accent-brand-purple"
              />
              <span>{text}</span>
            </label>
          ))}
        </fieldset>
        <label className="block">
          <span className="text-xs font-medium text-ink">Précisions (facultatif)</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={600}
            rows={3}
            className="mt-1 w-full rounded-lg border border-border-soft bg-surface px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink">Votre téléphone ou e-mail (facultatif, pour vous répondre)</span>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={80}
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-border-soft bg-surface px-3 py-2 text-sm text-ink"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-border-soft px-4 py-2 text-sm font-semibold text-ink">
            Annuler
          </button>
          <button type="submit" disabled={state === 'sending'} className="rounded-lg bg-brand-purple px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {state === 'sending' ? 'Envoi…' : 'Envoyer le signalement'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
