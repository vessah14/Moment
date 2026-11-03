import { Check, Copy, ExternalLink, MailCheck, MessageCircle, Palette, User, UserPlus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { eventShareUrl, getCurrentUser } from '../../api/client'
import { buildShareMessage, whatsappShareUrl } from '../../utils/shareMessage'
import { useToast } from '../../utils/useToast'
import Button from '../ui/Button'

const actionClass =
  'flex min-h-12 items-center gap-3 rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm font-semibold text-ink transition hover:border-brand-purple'

// Fin de l'assistant : au lieu de renvoyer vers la liste des événements, on dit ce qui vient
// d'arriver (en ligne, ou enregistrée en attendant la confirmation de l'adresse) et on
// propose la suite : partager, ajouter les invités, personnaliser.
export default function CreatedStep({ event, published, emailPending }) {
  const toast = useToast()
  const url = event.slug ? eventShareUrl(event.slug) : ''
  const guestsPath = `/dashboard/participants?eventId=${encodeURIComponent(event.id)}&add=1`
  const builderPath = `/builder/${event.id}`
  const email = getCurrentUser()?.email

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast('Lien copié')
    } catch {
      toast('Copie impossible : sélectionnez le lien et copiez-le.', { variant: 'warning' })
    }
  }

  const title = published ? 'Votre page est en ligne !' : emailPending ? 'Votre page est enregistrée' : 'Brouillon enregistré'
  const lead = published
    ? 'Envoyez-la à vos invités : chacun pourra l’ouvrir et confirmer sa présence.'
    : emailPending
      ? 'Il reste une étape avant de la partager : confirmer votre adresse e-mail.'
      : 'Personnalisez-la, puis publiez-la quand vous êtes prêt.'

  return (
    <div className="mx-auto max-w-2xl py-4 text-center sm:py-8">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white">
        {published ? <Check className="h-7 w-7" aria-hidden="true" /> : <MailCheck className="h-7 w-7" aria-hidden="true" />}
      </span>
      <h1 className="mt-5 text-[clamp(1.6rem,3.6vw,2.2rem)] leading-tight font-bold tracking-tight text-ink" tabIndex={-1}>
        {title}
      </h1>
      <p className="mt-2 text-muted">
        <b className="text-ink">{event.name}</b> · {lead}
      </p>

      {/* Deux façons d'envoyer : le même lien à un groupe, ou un lien personnel par invité
          (prénom dans la salutation, pass d'entrée, suivi de sa réponse). */}
      {published && url && (
        <div className="mt-7 grid gap-3 text-left sm:grid-cols-2">
          <section className="grid content-start gap-3 rounded-2xl border border-border-soft bg-surface p-4">
            <div>
              <p className="flex items-center gap-2 font-semibold text-ink">
                <Users className="h-4 w-4 text-brand-purple" aria-hidden="true" />
                Dans un groupe
              </p>
              <p className="mt-1 text-sm text-muted">Un seul lien pour tous, dans un groupe WhatsApp ou sur Facebook. Chacun ouvre la page et répond.</p>
            </div>
          <div className="flex items-center gap-2 rounded-xl border border-border-soft bg-bg p-2 pl-3">
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-ink">{url.replace(/^https?:\/\//, '')}</span>
            <button
              type="button"
              onClick={copy}
              className="inline-flex min-h-10 flex-none items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-semibold text-ink hover:border-brand-purple"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copier
            </button>
          </div>
          <Button
            as="a"
            href={whatsappShareUrl(buildShareMessage({ title: event.title || event.name, date: event.date, time: event.time, location: event.location, url, intro: event.intro }))}
            target="_blank"
            rel="noopener noreferrer"
            variant="gradient"
            className="w-full py-3"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Partager sur WhatsApp
          </Button>
          </section>
          <section className="grid content-start gap-3 rounded-2xl border border-border-soft bg-surface p-4">
            <div>
              <p className="flex items-center gap-2 font-semibold text-ink">
                <User className="h-4 w-4 text-brand-purple" aria-hidden="true" />
                À chaque invité
              </p>
              <p className="mt-1 text-sm text-muted">
                Ajoutez vos invités : chacun reçoit son lien personnel, avec son prénom, son pass d'entrée, et vous suivez sa réponse.
              </p>
            </div>
            <Button as={Link} to={guestsPath} variant="outline" className="w-full py-3">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Ajouter mes invités
            </Button>
          </section>
        </div>
      )}

      {!published && emailPending && (
        <ol className="mt-7 grid gap-3 text-left">
          <li className="flex gap-3 rounded-xl border border-brand-orange/30 bg-brand-orange/10 p-4 text-sm text-ink">
            <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-brand-orange text-xs font-bold text-white">1</span>
            {/* Le renvoi du lien est dans le bandeau de confirmation, juste au-dessus. */}
            <span className="min-w-0 flex-1">
              Cliquez sur le lien envoyé à <b className="break-all">{email ?? 'votre adresse'}</b> (pensez aux courriers indésirables).
            </span>
          </li>
          <li className="flex gap-3 rounded-xl border border-border-soft bg-surface p-4 text-sm text-ink">
            <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-surface-2 text-xs font-bold text-ink">2</span>
            <span>Revenez publier votre page : un clic sur « Publier » dans « Mes événements » ou dans la personnalisation.</span>
          </li>
        </ol>
      )}

      <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
        {/* Page en ligne : l'ajout des invités est proposé juste au-dessus (« À chaque invité »). */}
        {!published && (
          <Link to={guestsPath} className={actionClass}>
            <UserPlus className="h-5 w-5 flex-none text-brand-purple" aria-hidden="true" />
            <span>
              Ajouter mes invités
              <small className="block font-normal text-muted">Vous leur enverrez leur lien personnel une fois la page en ligne.</small>
            </span>
          </Link>
        )}
        <Link to={builderPath} className={actionClass}>
          <Palette className="h-5 w-5 flex-none text-brand-purple" aria-hidden="true" />
          {published ? 'Personnaliser ma page' : 'Voir et personnaliser ma page'}
        </Link>
        {published && event.slug && (
          <a href={`/e/${encodeURIComponent(event.slug)}`} target="_blank" rel="noopener noreferrer" className={actionClass}>
            <ExternalLink className="h-5 w-5 flex-none text-brand-purple" aria-hidden="true" />
            Voir ma page comme un invité
          </a>
        )}
      </div>

      <Link
        to="/dashboard/evenements"
        state={{ highlightEventId: event.id, highlightLabel: 'Nouveau' }}
        className="mt-6 inline-block text-sm font-medium text-muted hover:text-ink"
      >
        Aller à mes événements
      </Link>
    </div>
  )
}
