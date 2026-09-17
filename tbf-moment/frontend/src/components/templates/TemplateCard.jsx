import { Link } from 'react-router-dom'

export default function TemplateCard({ name, meta, badge }) {
  return (
    <div className="group">
      <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-panel))]">
        <span
          className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${
            badge === 'PREMIUM'
              ? 'bg-[color:var(--color-gold)] text-bg'
              : 'bg-black/50 text-ink'
          }`}
        >
          {badge}
        </span>

        <Link
          to="/builder"
          className="absolute bottom-3 left-3 rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
        >
          Utiliser ce modèle
        </Link>
      </div>
      <h3 className="mt-4 font-semibold text-ink">{name}</h3>
      <p className="mt-1 text-sm text-faint">{meta}</p>
    </div>
  )
}
