import { Link } from 'react-router-dom'
import { EVENT_CATEGORIES, MODULE_LINKS } from '../../data/eventCategories'
import { formatEventDate, formatTimeRange } from '../../utils/formatDate'
import { slugify } from '../../utils/slugify'

export default function EventPreviewPanel({ event }) {
  const slug = slugify(event.name.split(' de ').pop() || event.name)
  const categoryData = EVENT_CATEGORIES.find((c) => c.label === event.category)
  const modules = categoryData?.modules ?? []

  return (
    <aside className="h-fit rounded-2xl border border-border-soft bg-panel p-6 lg:sticky lg:top-8">
      <p className="text-xs font-semibold tracking-widest text-faint uppercase">
        Aperçu
      </p>

      <div
        className="relative mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-surface))] bg-cover bg-center"
        style={
          event.coverImage ? { backgroundImage: `url(${event.coverImage})` } : undefined
        }
      >
        {!event.coverImage && <span className="text-xs text-faint">couverture</span>}
      </div>

      <h3 className="mt-4 font-semibold text-ink">{event.name}</h3>
      <p className="mt-1 text-sm text-muted">
        {formatEventDate(event.date)} · {formatTimeRange(event)}
        {event.location && ` · ${event.location}`}
      </p>

      <dl className="mt-5 space-y-3 border-t border-border-soft pt-5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-faint">Catégorie</dt>
          <dd className="text-right font-medium text-ink">{event.category}</dd>
        </div>
        {event.template && (
          <div className="flex items-center justify-between">
            <dt className="text-faint">Modèle</dt>
            <dd className="font-medium text-ink">{event.template}</dd>
          </div>
        )}
        <div className="flex items-center justify-between">
          <dt className="text-faint">Modules activés</dt>
          <dd className="font-medium text-ink">{modules.length}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-faint">URL publique</dt>
          <dd className="font-medium text-brand-purple">/{slug}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-faint">Plan</dt>
          <dd>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold text-muted">
              {event.plan}
            </span>
          </dd>
        </div>
      </dl>

      {modules.length > 0 && (
        <>
          <p className="mt-5 text-xs font-semibold tracking-wider text-faint uppercase">
            Modules suggérés
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {modules.map((mod) => {
              const to = MODULE_LINKS[mod]
              const className =
                'rounded-full border px-3 py-1.5 text-xs font-medium transition ' +
                (to
                  ? 'border-brand-purple/50 text-brand-purple hover:bg-brand-purple/10'
                  : 'border-border text-muted')
              return to ? (
                <Link key={mod} to={to} className={className}>
                  {mod}
                </Link>
              ) : (
                <span key={mod} className={className}>
                  {mod}
                </span>
              )
            })}
          </div>
        </>
      )}
    </aside>
  )
}
