import { Check, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicSite, registerPublicGuest } from '../api/publicEvents'
import EventLoader from '../components/site/EventLoader'
import Button from '../components/ui/Button'
import { formatEventDate } from '../utils/eventStatus'
import { useSeo } from '../utils/seo'

export default function PublicGuestRegistration() {
  const { slug } = useParams()
  const [site, setSite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    seats: 1,
    whatsAppRemindersConsent: false,
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError('')
    getPublicSite(slug)
      .then((data) => {
        if (!cancelled) setSite(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError("Ce lien d’inscription n’est pas disponible.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  const event = site?.event
  useSeo({
    title: event?.name ? `Inscription · ${event.name}` : 'Inscription à un événement',
    noindex: true,
  })

  const update = (patch) => setForm((current) => ({ ...current, ...patch }))

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await registerPublicGuest(slug, {
        ...form,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        seats: Number(form.seats),
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || "L’inscription n’a pas pu être enregistrée.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <EventLoader slug={slug} />

  return (
    <main className="min-h-svh bg-bg px-4 py-10 text-ink sm:py-16">
      <div className="mx-auto max-w-xl">
        <Link to={`/e/${encodeURIComponent(slug)}`} className="text-sm font-semibold text-brand-purple hover:underline">
          ← Retour à l’événement
        </Link>
        <section className="mt-5 rounded-3xl border border-border-soft bg-surface p-5 shadow-sm sm:p-8">
          {loadError ? (
            <div className="py-8 text-center">
              <p className="text-lg font-bold">{loadError}</p>
              <p className="mt-2 text-sm text-muted">Vérifiez le lien ou demandez-en un nouveau à l’organisateur.</p>
            </div>
          ) : submitted ? (
            <div className="py-8 text-center" role="status">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white">
                <Check className="h-7 w-7" aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-2xl font-bold">Inscription enregistrée</h1>
              <p className="mt-2 text-muted">
                Vous êtes ajouté(e) à la liste de <b className="text-ink">{event?.name}</b>. L’organisateur vous communiquera les prochaines informations.
              </p>
              {form.whatsAppRemindersConsent && (
                <p className="mt-3 text-sm text-muted">Votre accord pour les rappels WhatsApp est enregistré.</p>
              )}
              <Button as={Link} to={`/e/${encodeURIComponent(slug)}`} variant="outline" className="mt-6">
                Retour à l’événement
              </Button>
            </div>
          ) : (
            <>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-purple/10 text-brand-purple">
                <Users className="h-6 w-6" aria-hidden="true" />
              </span>
              <h1 className="mt-4 text-2xl font-bold">Inscrivez-vous à {event?.name}</h1>
              {event?.eventDate && (
                <p className="mt-1 text-sm text-muted">{formatEventDate(event.eventDate)}</p>
              )}
              <p className="mt-3 text-sm text-muted">
                Indiquez vos coordonnées pour être ajouté(e) à la liste des invités.
              </p>

              <form className="mt-6 grid gap-4" onSubmit={submit}>
                <label className="grid gap-1.5 text-sm font-medium">
                  Votre nom complet
                  <input
                    className="min-h-11 rounded-xl border border-border bg-bg px-3 text-ink outline-none focus:border-brand-purple"
                    autoComplete="name"
                    maxLength={255}
                    required
                    value={form.fullName}
                    onChange={(e) => update({ fullName: e.target.value })}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Votre numéro WhatsApp
                  <input
                    className="min-h-11 rounded-xl border border-border bg-bg px-3 text-ink outline-none focus:border-brand-purple"
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                    required
                    value={form.phone}
                    placeholder="Ex. 675 12 34 72"
                    onChange={(e) => update({ phone: e.target.value })}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  E-mail <span className="font-normal text-muted">(facultatif)</span>
                  <input
                    className="min-h-11 rounded-xl border border-border bg-bg px-3 text-ink outline-none focus:border-brand-purple"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={form.email}
                    onChange={(e) => update({ email: e.target.value })}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Nombre de personnes, vous compris
                  <span className="flex min-h-12 items-center justify-between rounded-xl border border-border bg-bg p-1.5">
                    <button
                      type="button"
                      aria-label="Une personne de moins"
                      onClick={() => update({ seats: Math.max(1, Number(form.seats) - 1) })}
                      disabled={Number(form.seats) <= 1}
                      className="grid h-10 w-10 place-items-center rounded-lg text-lg font-semibold text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="min-w-10 text-center text-base font-semibold" aria-live="polite">{form.seats}</span>
                    <button
                      type="button"
                      aria-label="Une personne de plus"
                      onClick={() => update({ seats: Math.min(50, Number(form.seats) + 1) })}
                      disabled={Number(form.seats) >= 50}
                      className="grid h-10 w-10 place-items-center rounded-lg text-lg font-semibold text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border-soft bg-bg p-3 text-sm">
                  <input
                    className="mt-0.5 h-4 w-4 accent-brand-purple"
                    type="checkbox"
                    checked={form.whatsAppRemindersConsent}
                    onChange={(e) => update({ whatsAppRemindersConsent: e.target.checked })}
                  />
                  <span>J’accepte de recevoir des rappels concernant cet événement sur WhatsApp. <span className="text-muted">(facultatif)</span></span>
                </label>
                <p className="text-xs text-muted">
                  Vos coordonnées sont transmises à l’organisateur pour gérer votre inscription. La case WhatsApp est facultative.
                </p>
                {error && <p className="text-sm text-danger" role="alert">{error}</p>}
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Inscription…' : 'M’inscrire'}
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
