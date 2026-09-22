import { CheckCircle2 } from 'lucide-react'
import { formatEventDate, formatTimeRange } from '../../utils/formatDate'
import { slugify } from '../../utils/slugify'
import Button from '../ui/Button'

export default function PublicationStep({
  event,
  visibility,
  onPublish,
  publishing,
  error,
}) {
  const slug = slugify(event.name.split(' de ').pop() || event.name)
  const guestCount = event.guests?.length ?? 0

  const recap = [
    { label: "Nom de l'événement", value: event.name },
    {
      label: 'Date & Lieu',
      value: `${formatEventDate(event.date)}${event.location ? ' - ' + event.location : ''}`,
    },
    { label: 'Catégorie', value: event.category },
    { label: 'Template sélectionné', value: event.template ?? 'Page vierge' },
    { label: 'Audience', value: `${guestCount} invité(s) configuré(s)` },
  ]

  const activeOptionLabels = {
    checkin: "Module RSVP avec QR Code check-in",
    program: 'Programme détaillé interactif',
    gallery: 'Galerie partagée pour partage photos',
    ticketing: 'Billetterie & vente en ligne',
    guestbook: "Livre d'or interactif",
  }
  const activeFeatures = Object.entries(event.options ?? {})
    .filter(([, on]) => on)
    .map(([key]) => activeOptionLabels[key])
    .filter(Boolean)

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">
        Aperçu et publication de l'événement
      </h2>
      <p className="mt-2 text-sm text-muted">
        Vérifiez la mise en page de votre mini-site public et le récapitulatif
        des configurations choisies avant de diffuser votre invitation.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface">
          <div className="flex items-center gap-1.5 border-b border-border-soft bg-surface-2 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-brand-orange/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
            <span className="ml-3 truncate rounded-full bg-surface px-3 py-1 text-xs text-faint">
              moment.tbf/{slug}
            </span>
          </div>
          <div
            className="flex aspect-4/3 flex-col items-center justify-center gap-3 px-6 text-center"
            style={{
              background: `linear-gradient(160deg, ${event.themeColor}22, var(--color-surface))`,
            }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface-2 text-faint">
              <span className="text-xs">image</span>
            </div>
            <p className="font-serif text-2xl font-bold text-ink">
              {event.name.split(' de ').pop() || event.name}
            </p>
            <p className="text-sm text-muted">
              {formatEventDate(event.date)} · {formatTimeRange(event)}
              {event.location && ` · ${event.location}`}
            </p>
            <div className="mt-2 flex gap-2">
              <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-sm">
                Confirmer RSVP
              </span>
              {event.options?.program && (
                <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-sm">
                  Voir Programme
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-soft bg-surface p-5">
          <p className="text-sm font-semibold text-ink">Récapitulatif</p>
          <dl className="mt-4 space-y-3 text-sm">
            {recap.map((item) => (
              <div key={item.label}>
                <dt className="text-[11px] font-semibold tracking-wider text-faint uppercase">
                  {item.label}
                </dt>
                <dd className="mt-0.5 font-medium text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>

          {activeFeatures.length > 0 && (
            <div className="mt-5 border-t border-border-soft pt-4">
              <p className="text-[11px] font-semibold tracking-wider text-faint uppercase">
                Fonctionnalités activées
              </p>
              <ul className="mt-2 space-y-1.5">
                {activeFeatures.map((label) => (
                  <li
                    key={label}
                    className="flex items-start gap-1.5 text-xs text-muted"
                  >
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <p className="mt-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="mt-6 space-y-2 border-t border-border-soft pt-5">
            <Button
              variant="gradient"
              disabled={publishing}
              onClick={() => onPublish('publish')}
              className="w-full disabled:opacity-70"
            >
              {publishing && visibility === 'publish'
                ? 'Publication...'
                : "Publier l'événement"}
            </Button>
            <Button
              variant="outline"
              disabled={publishing}
              onClick={() => onPublish('draft')}
              className="w-full disabled:opacity-70"
            >
              {publishing && visibility === 'draft'
                ? 'Enregistrement...'
                : 'Enregistrer en brouillon'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
