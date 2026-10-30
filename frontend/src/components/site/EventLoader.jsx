import { readEventLook, titleFromSlug } from '../../utils/eventLook'

// Écran de chargement d'un site d'événement, sans la marque TBF Moment : logo ou monogramme
// de l'événement, son titre et sa couleur (mémorisés à la visite précédente), sinon le
// titre tiré de l'adresse. Sert pendant le téléchargement de la page puis de ses données.
export default function EventLoader({ slug, title }) {
  const look = readEventLook(slug)
  const name = title || look?.title || titleFromSlug(slug)
  const accent = look?.accent || 'var(--color-brand-purple)'
  const monogram = look?.monogram || (name ? name.trim().charAt(0).toUpperCase() : '')

  return (
    <main
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-bg px-6 text-center text-ink"
      role="status"
      aria-label={name ? `Chargement de « ${name} »` : 'Chargement de l’événement'}
    >
      {look?.logo ? (
        <img src={look.logo} alt="" className="h-16 max-w-40 object-contain animate-pulse motion-reduce:animate-none" />
      ) : monogram ? (
        <span
          className="flex h-16 min-w-16 items-center justify-center rounded-full px-3 text-xl font-bold text-white animate-pulse motion-reduce:animate-none"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        >
          {monogram}
        </span>
      ) : null}
      {name && <p className="max-w-md text-lg font-semibold text-balance">{name}</p>}
      <span className="relative h-1 w-40 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
        <span
          className="absolute inset-y-0 left-0 w-1/3 rounded-full motion-safe:animate-[event-loader_1.2s_ease-in-out_infinite]"
          style={{ backgroundColor: accent }}
        />
      </span>
      <style>{'@keyframes event-loader { 0% { left: -33% } 100% { left: 100% } }'}</style>
    </main>
  )
}
