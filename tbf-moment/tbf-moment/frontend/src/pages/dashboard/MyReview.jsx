import { Check, Clock, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { deleteMyReview, getMyReview, saveMyReview } from '../../api/account'
import { getCurrentUser } from '../../api/client'
import DashboardLayout from '../../components/layout/DashboardLayout'

// Avis du client sur TBF Moment : une note et un commentaire, publiés sur la page
// d'accueil après validation par l'équipe. Toute modification repasse en validation.

const inputClass =
  'mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30'

// « Awa Diop » -> « Awa D. » : nom affiché par défaut, discret.
function defaultDisplayName() {
  const parts = (getCurrentUser()?.fullName ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
}

const STATUS = {
  EnAttente: { label: 'En attente de validation', icon: Clock, className: 'border-brand-orange/30 bg-brand-orange/10 text-brand-orange' },
  Publie: { label: 'Publié sur la page d’accueil', icon: Check, className: 'border-success/30 bg-success/10 text-success' },
  Refuse: { label: 'Non publié', icon: X, className: 'border-danger/30 bg-danger/10 text-danger' },
}

export default function MyReview() {
  const [loading, setLoading] = useState(true)
  const [review, setReview] = useState(null)
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [displayName, setDisplayName] = useState(defaultDisplayName)
  const [context, setContext] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getMyReview()
      .then((data) => {
        if (cancelled || !data) return
        setReview(data)
        setRating(data.rating)
        setComment(data.comment)
        setDisplayName(data.displayName)
        setContext(data.context ?? '')
      })
      .catch(() => !cancelled && setError('Impossible de charger votre avis.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      const saved = await saveMyReview({ rating, comment: comment.trim(), displayName: displayName.trim(), context: context.trim() || null })
      setReview(saved)
      setMessage('Merci ! Votre avis sera publié après validation par notre équipe.')
    } catch (err) {
      setError(err.message || "Votre avis n'a pas pu être enregistré.")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    setError('')
    setMessage('')
    try {
      await deleteMyReview()
      setReview(null)
      setComment('')
      setContext('')
      setRating(5)
      setMessage('Votre avis a été supprimé.')
    } catch (err) {
      setError(err.message || "Votre avis n'a pas pu être supprimé.")
    }
  }

  const status = review ? STATUS[review.status] : null
  const shown = hover || rating

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-ink">Mon avis sur TBF Moment</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Racontez votre expérience en quelques mots. Après validation par notre équipe, votre avis apparaît dans les
        témoignages de la page d’accueil.
      </p>

      {loading ? (
        <p className="mt-10 text-sm text-faint">Chargement…</p>
      ) : (
        <form onSubmit={submit} className="mt-8 max-w-2xl space-y-6 rounded-2xl border border-border-soft bg-surface p-6">
          {status && (
            <p className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${status.className}`}>
              <status.icon className="h-4 w-4" />
              {status.label}
            </p>
          )}

          <fieldset>
            <legend className="text-sm font-medium text-ink">Votre note</legend>
            <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="cursor-pointer p-0.5" onMouseEnter={() => setHover(n)}>
                  <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="peer sr-only" />
                  <Star
                    aria-hidden="true"
                    className={`h-8 w-8 rounded transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand-purple ${n <= shown ? 'fill-current text-brand-orange' : 'text-border'}`}
                  />
                  <span className="sr-only">{n} étoile{n > 1 ? 's' : ''} sur 5</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium text-ink">Votre commentaire</span>
            <textarea
              required
              minLength={10}
              maxLength={1000}
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ex. En une soirée on avait un site, les invitations envoyées et les premières confirmations…"
              className={`${inputClass} resize-y`}
            />
            <span className="mt-1 block text-right text-xs text-faint">{comment.length}/1000</span>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-ink">Nom affiché</span>
              <input required maxLength={80} value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Votre événement (facultatif)</span>
              <input maxLength={80} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Ex. Mariage · Douala" className={inputClass} />
            </label>
          </div>

          {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          {message && <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">{message}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3">
            {review ? (
              <button type="button" onClick={remove} className="text-sm font-semibold text-danger hover:underline">
                Supprimer mon avis
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50"
            >
              {saving ? 'Envoi…' : review ? 'Mettre à jour mon avis' : 'Publier mon avis'}
            </button>
          </div>
        </form>
      )}
    </DashboardLayout>
  )
}
