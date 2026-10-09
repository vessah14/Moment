import { ArrowRight, ChevronDown, Eye } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import TemplatePreview, { TemplateBadge } from './TemplatePreview'

// Carte d'un modèle, identique pour tous (premium ou classique) : miniature 4/3, nom ·
// type, description courte, puis les actions. « Voir plus » déplie la description complète
// et les points forts. Repliées, toutes les cartes ont la même taille ; une carte dépliée
// grandit seule, sans étirer ses voisines de rangée.
// Les couleurs suivent le thème clair / sombre de l'application ; seule la miniature
// garde les couleurs du modèle, puisqu'elle le représente.

const templateUseHref = (name) => `/dashboard/evenements/nouveau?modele=${encodeURIComponent(name)}`

// Modèles classiques : description et points forts déduits de leur composition.
function classicDetails(template) {
  const tone = template.minimal ? 'sobre' : template.meta?.includes('sombre') ? 'sombre' : 'clair'
  const sections = (template.blocks ?? []).filter((b) => b !== 'Pied de page')
  return {
    description: `Mise en page classique au fond ${tone}, entièrement personnalisable dans le Builder.`,
    features: [
      { label: 'Style', text: `couleurs du modèle, police ${template.preview?.serif ? 'élégante' : 'moderne'}` },
      { label: 'Sections', text: sections.join(', ') || 'à composer librement' },
      { label: 'Catégorie', text: template.category },
    ],
  }
}

export default function TemplateCard({ template }) {
  const premium = Boolean(template.theme)
  const { description, features } = premium
    ? { description: template.description, features: template.features ?? [] }
    : classicDetails(template)
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()

  return (
    <article className="group flex flex-col self-start overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-purple/50 hover:shadow-lg">
      <div className="relative aspect-4/3 overflow-hidden border-b border-border-soft">
        {template.image ? (
          <img src={template.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <TemplatePreview template={template} preview={template.preview} minimal={template.minimal} />
        )}
        <TemplateBadge badge={template.badge} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="truncate text-lg font-bold text-ink" title={`${template.name} · ${template.subtitle ?? template.category}`}>
          {template.name}
          <span className="font-medium text-muted"> · {template.subtitle ?? template.category}</span>
        </h3>
        <div id={detailsId}>
          <p className={`min-h-[2.85rem] text-sm leading-relaxed text-muted ${expanded ? '' : 'line-clamp-2'}`}>
            {description}
          </p>
          {expanded && features.length > 0 && (
            <ul className="mt-3 grid gap-1.5 text-sm">
              {features.map((f) => (
                <li key={f.label} className="flex items-start gap-2 leading-snug text-ink">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 rounded-[2px] bg-[color:var(--color-gold)]" />
                  <span>
                    <b className="font-semibold">{f.label} :</b> <span className="text-muted">{f.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 self-start text-sm font-semibold text-brand-purple hover:underline"
        >
          {expanded ? 'Voir moins' : 'Voir plus'}
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        <div className={`mt-auto grid gap-2 pt-2 ${premium ? 'grid-cols-2' : ''}`}>
          {premium && (
            <Link
              to={`/modeles/${template.theme}`}
              className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-sm font-semibold text-ink transition hover:border-brand-purple hover:text-brand-purple"
            >
              <Eye className="h-4 w-4" />
              Aperçu
            </Link>
          )}
          <Link
            to={templateUseHref(template.name)}
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] px-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105"
          >
            Utiliser
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
