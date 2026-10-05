import { Link } from 'react-router-dom'
import TemplatePreview, { TemplateBadge } from './TemplatePreview'

export default function TemplateCard({ name, meta, badge, image, preview, minimal }) {
  return (
    <div className="group">
      <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-border-soft bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-panel))] transition group-hover:-translate-y-0.5 group-hover:shadow-lg">
        {image ? (
          <img
            src={image}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <TemplatePreview preview={preview} minimal={minimal} />
        )}
        <TemplateBadge badge={badge} />

        {/* Toujours visible sur mobile (pas de survol au toucher), au survol sur ordinateur. */}
        <Link
          to={`/dashboard/evenements/nouveau?modele=${encodeURIComponent(name)}`}
          className="absolute bottom-3 left-3 z-10 rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white shadow-md transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
          Utiliser ce modèle
        </Link>
      </div>
      <h3 className="mt-4 font-semibold text-ink">{name}</h3>
      <p className="mt-1 text-sm text-faint">{meta}</p>
    </div>
  )
}
